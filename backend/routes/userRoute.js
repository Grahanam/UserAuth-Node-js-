const express=require('express')
const route=express.Router()
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const saltRounds=10
const multer = require('multer');
const UUID = require("uuid-v4");
const bucket=require('../firebaseadmin')
const upload = multer({ storage: multer.memoryStorage() });
const uploadFile=require('../firebasestorage/upload')
const secret_key=process.env.SECRET_KEY


const userModel=require('../models/userModel')
const { userAuth, useradminAuth } = require('../middleware/auth')

const checkEmail=(email)=>{
    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email)   
}

const checkMobile=(number)=>{
    const Number=parseInt(number)
    // const regex=/^\d+$/
    const regex=/^\d{10}$/
    return regex.test(Number)
}


route.post('/login',async(req,res)=>{
    try{
        // console.log(req.body)
        const {email,number,password}=req.body
        let finduser
        if(!password){
            return res.status(402).json({message:'Provide Password'})
        }
        if(email || number){
            if(email){
                finduser=await userModel.findOne({email:email})
                if(!finduser){
                    return res.status(402).json({message:'Email not found'})
                }
            }
            if(number){
                let num=parseInt(number)
                finduser=await userModel.findOne({mobile:num})
                if(!finduser){
                    return res.status(402).json({message:'Number not found'})
                }
            }  
        }else{
            return res.status(402).json({message:'Provide Email/Number'})
        }
        const hash=await bcrypt.compare(password,finduser.password)
            if(!hash){
                return res.status(402).json({message:'Password incorrect'}) 
            }

        const token=jwt.sign({userid:finduser._id,user:finduser.name,role:finduser.role},secret_key,{expiresIn:'1h'})
        if(!token){
            return res.status(402).json({message:'Jwt error'})
        }
        
    
        res.status(200).json({token:token,message:'success'})

    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal Server Error'})
    }
})


//Signup request
route.post('/signup',upload.single('file'),async(req,res)=>{
    try{
        // console.log(req.body)
        // console.log(req.file)
        let {number,email,name,password}=req.body

        //check if number or email provided
        if(number || email){
            //validate number
            if(number){
                number=parseInt(number)
                if(!checkMobile(number) || number.toString().length!==10 ){
                    return res.status(402).json({message:'Provide Valid Number'})
                }
                //check if user with this number already present
                let finduser=await userModel.findOne({mobile:number})
                if(finduser){
                    return res.status(402).json({message:'User with this Number already exist'})
                }
            }
            //validate email
            if(email){
               if(!checkEmail(email)){
                    return res.status(402).json({message:'Provide Valid Email'})
               }
               //check if user with this email already present
               let finduser=await userModel.findOne({email:email})
                if(finduser){
                    return res.status(402).json({message:'User with this Email already exist'})
                }
            }
            
        }else{
            return res.status(402).json({message:'Provide email or number'})
        }

        //validate password
        password=password.trim()
        if(password.length<6 || password.length>10){
            return res.status(402).json({message:'Password length min-6 to max-10'})
        }
        //validate name
        if(name){
            name=name.trim()
            if(name.length==0){
                return res.status(402).json({message:'Provide valid name'})
            }
            
        }else{
            return res.status(402).json({message:'Provide name'})
        }
        
        //hash password
        const hash=await bcrypt.hash(password,saltRounds)
        

        const newUser=new userModel()

        if(req.file){
            //validate profile image type
            let filemime=req.file.mimetype
            // console.log(filemime)
            let allowedfile=['image/png','image/jpeg','image/jpg']
            if(!allowedfile.includes(filemime)){
                return res.status(400).json({message:'Only jpeg,jpg and png images are allowed'})
            }
            //save image to firebase storage
            const filename = `ipl/profile_img/${Date.now()}_${req.file.originalname}`;
            const uuid=UUID()
            const fileURL = await uploadFile(req.file.buffer, filename, req.file.mimetype,uuid);
            //save path and image url to image oject
            const image={
               url:fileURL,
               path:filename
            }
            newUser.image=image   
        }else{
            return res.status(402).json({message:'Provide User Profile'})
        }

        
        newUser.name=name
        newUser.password=hash
        if(number){
           newUser.mobile=number
        }
        if(email){
           newUser.email=email
        }
        
        // console.log(newUser)
        //save user
        const saveUser=await newUser.save()

        console.log('saveuser',saveUser)
        res.status(200).json({id:saveUser._id,message:'New User created'})

    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal Server Error'})
    }
})


//Single User request 
route.get('/:id',useradminAuth,async(req,res)=>{
    try{
        const id=req.params.id
        //find user by id
        const User=await userModel.findById(id)
        res.status(200).json({user:User})
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal Server Error'})
    }
})

//Update User
route.put('/:id',useradminAuth,upload.single('file'),async(req,res)=>{
    try{
        // console.log(req.file)
        const {name,email,number}=req.body
        // console.log(req.body)
        const id=req.params.id
        const finduser=await userModel.findById(id)

        //check if user already has mobile number
        if(!finduser.mobile&&number){
            if(!checkMobile(number)){
               return res.status(400).json({message:'Invalid Mobile'}) 
            }
            const checkuser=await userModel.findOne({mobile:number})
            if(checkuser){
                return res.status(400).json({message:'User with this mobile already exist'})
            }
            finduser.mobile=number
        }
        //check if user already has email
        if(!finduser.email&&email){
            if(!checkEmail(number)){
                return res.status(400).json({message:'Invalid Email'}) 
            }
            const checkuser=await userModel.findOne({email:email})
            if(checkuser){
                return res.status(400).json({message:'User with this email already exist'})
            }
            finduser.email=email
        }
        if(!finduser){
            res.status(400).json({message:'User Not Found'})
        }
        if(name){
            finduser.name=name
        }
        if(req.file){
            //validate profile image type
            let filemime=req.file.mimetype
            // console.log(filemime)
            let allowedfile=['image/png','image/jpeg','image/jpg']
            if(!allowedfile.includes(filemime)){
                return res.status(400).json({message:'Only jpeg,jpg and png images are allowed'})
            }
            
            //delete old image before update
            if(finduser.image.path){
                await bucket.file(finduser.image.path).delete()
            }
            //save new image
            const filename = `ipl/profile_img/${Date.now()}_${req.file.originalname}`;
            const uuid=UUID()
            const fileURL = await uploadFile(req.file.buffer, filename, req.file.mimetype,uuid);
            const image={
               url:fileURL,
               path:filename
            }
            finduser.image=image   
        }
        const updateuser=await userModel.findByIdAndUpdate(finduser._id,finduser,{new:true})

        res.status(200).json({data:updateuser,message:'User Updated Successfully'})
       
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal Server Error'})
    }
})

//Delete User
route.delete('/:id',useradminAuth,async(req,res)=>{
    try{
        // console.log(req.params.id)
        const id=req.params.id
        const finduser=await userModel.findById(id)
        //delete profile image 
        if(finduser.image.url){
            await bucket.file(finduser.image.path).delete()
        }
        //delete user
        const User=await userModel.findByIdAndDelete(finduser._id)
        res.status(200).json({message:'User Deleted Successfully'})
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal Server Error'})
    }
})



module.exports=route