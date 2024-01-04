const express=require('express')
const { adminAuth } = require('../middleware/auth')
const route=express.Router()
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const userModel=require('../models/userModel')
const secret_key=process.env.SECRET_KEY 
const saltRounds=10
const multer = require('multer');
const UUID = require("uuid-v4");
const bucket=require('../firebaseadmin')
const upload = multer({ storage: multer.memoryStorage() });
const uploadFile=require('../firebasestorage/upload')



route.post('/login',async(req,res)=>{
    try{
        console.log(req.body)
        const {email,number,password}=req.body
        let finduser
        if(!password){
            return res.status(402).json({message:'Provide Password'})
        }
        if(email || number){
            if(email){
                finduser=await userModel.findOne({email:email})
                if((finduser&&finduser.role!=='admin')||!finduser){
                    return res.status(402).json({message:'Email not found'})
                }
            }
            if(number){
                finduser=await userModel.findOne({number:number})
                if(!finduser){
                    return res.status(402).json({message:'Number not found'})
                }
            }  
        }else{
            return res.status(402).json({message:'Provide Email/Number'})
        }
        const result=await bcrypt.compare(password,finduser.password)
        if(!result){
            return res.status(402).json({message:'Incorrect Password'})
        }

        const token=await jwt.sign({userid:finduser._id,user:finduser.name,role:finduser.role},secret_key,{expiresIn:'1h'})
        if(!token){
            return res.status(402).json({message:'Jwt error'})
        }
        
    
        res.status(200).json({token:token,message:'success'})

    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal Server Error'})
    }
})

route.post('/createadmin',adminAuth,async(req,res)=>{
    try{
        console.log(req.body)
        let {number,email,name,password}=req.body
        if(email){
            if(email){
               const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
               if(!regex.test(email)){
                    return res.status(402).json({message:'Provide Valid Email'})
               }
               let finduser=await userModel.findOne({email:email})
                if(finduser){
                    return res.status(402).json({message:'User with this Email already exist'})
                }
            }
            
        }else{
            return res.status(402).json({message:'Provide email'})
        }
        if(password.length<6 || password.length>10){
            return res.status(402).json({message:'Password length min-6 to max-10'})
        }
        if(name){
            const regex=/^\S.*\S$/
            name=name.trim()
            if(name.length==0){
                return res.status(402).json({message:'Provide valid name'})
            }
            
        }else{
            return res.status(402).json({message:'Provide name'})
        }

        const hash=await bcrypt.hash(password,saltRounds)

        const newUser=new userModel()
        newUser.name=name
        newUser.password=hash
        newUser.email=email
        newUser.role='admin'
        console.log(newUser)
        const saveUser=await newUser.save()

        console.log('saveuser',saveUser)
        

        res.status(200).json({id:saveUser._id,message:'New Admin created'})

    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal Server Error'})
    }
      
})


//all user
route.get('/user',adminAuth,async(req,res)=>{
    try{
        const User=await userModel.find({role:'user'})
        const Admin=await userModel.find({role:'admin'})
        res.status(200).json({user:User,admin:Admin})
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal Server Error'})
    }
})








module.exports=route