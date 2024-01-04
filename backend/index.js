require('dotenv').config()
const express=require('express')
const app=express()
const mongoose=require('mongoose')
const port=process.env.port||4000
const url=process.env.url
const userModel=require('./models/userModel')
const bcrypt=require('bcrypt')
const path=require('path')
const saltRounds = 10;
const cors=require('cors')

const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json())
app.use(cors())

app.use('/api/',userRoute)
app.use('/api/admin/',adminRoute)

//Serve static pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(port,()=>{
    console.log(`Server running on ${port}`)
})



mongoose.connect(url)
const db=mongoose.connection
db.on('error',(error)=>{
    console.log('MongoDB connection error:',error)
})
db.once('open',()=>{
    console.log('Connected to MongoDB')
})


//manually create first admin account

async function createadmin(){
      try{
        const password='admin123456'
        const hash=await bcrypt.hash(password,saltRounds)

        const Admin=new userModel({
            email:'admin@gmail.com',
            name:"admin",
            password:hash,
            role:"admin"
        })
        console.log(Admin)
        const newadmin=await Admin.save()
        console.log('Admin created')
         
      }catch(err){
        console.log(err)
      }
}
// createadmin()