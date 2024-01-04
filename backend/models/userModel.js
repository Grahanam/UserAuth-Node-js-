const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        sparse:true
    },
    mobile:{
        type:Number,
        unique:true,
        sparse:true
    },
    name:{
        type:String,
        required:true
    },
    image:{
        url:{
            type:String
        },
        path:{
            type:String
        }
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }

})

module.exports=mongoose.model('User',userSchema)