import { faSwatchbook } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import {useNavigate} from "react-router-dom"

import Cookies from 'universal-cookie'
import MyContext from "../myContext"
const cookies=new Cookies()
const VITE_BASE_URL=import.meta.env.VITE_BASE_URL

const Auth=({Login})=>{
    const {token,settoken}=useContext(MyContext)
    const [bool,setbool]=useState(false)
    const [formdata,setformdata]=useState({
        emailnumber:'',
        email:'',
        number:'',
        name:'',
        password:'',
        confirmpassword:''
    })

    const [passalert,setpassalert]=useState(false)
    const [pass2alert,setpass2alert]=useState(false)
    const [emailalert,setemailalert]=useState(false)
    const [mobilealert,setmobilealert]=useState(false)
    const [errormessage,seterrormessage]=useState('')
    const [signupdone,setsignupdone]=useState(false)
    const [number,setnumber]=useState('')
    const [name,setname]=useState('')
    const [file,setfile]=useState(null)
    const [password,setpassword]=useState('')
    const [confirmpassword,setconfirmpassword]=useState('')
    const [role,setrole]=useState('user')

    const navigate=useNavigate()
    
    const signup=(event)=>{
        event.preventDefault()
        if(formdata.email==''&&formdata.number==''){
            seterrormessage('Provide Email or Number')
            seterrormessage(message)
            setTimeout(()=>{
                seterrormessage('')
            },5000)
        }else if(emailalert||mobilealert||passalert||pass2alert){
            let message=''
            {emailalert?message+='Invalid Email ':''}
            {mobilealert?message+='[Invalid Mobile !] ':''}
            {passalert?message+='[Password Not Matched !] ':''}
            {pass2alert?message+='[Password min:6 & max:10 !]':''}
            seterrormessage(message)
            setTimeout(()=>{
                seterrormessage('')
            },5000)
        }else{
            const data=new FormData()
            data.append('file',file)
            if(formdata.email!=''){
                data.append('email',formdata.email)
            }
            if(formdata.number!=''){
                data.append('number',formdata.number)
            }
            data.append('name',formdata.name)
            data.append('password',formdata.password)
            
            fetch(`${VITE_BASE_URL}/signup`,{
                method:"POST",
                headers:{
                    "Accept":"application/json",
                },
                body:data
            }).then(response=>response.json())
            .then((response)=>{
                if(response.id){
                    setsignupdone(true)
                    console.log(response.id)
                    const body={
                        password:formdata.password
                    }
                    if(formdata.email!==''){
                        body.email=formdata.email
                    }else{
                        body.number=formdata.number
                    }
                    // alert(response.message)
                    Login(body)
                }
                else{
                    alert(response.message)              
                }
            })
            .catch((err)=>{
                alert('Internal Server Error')
            })

        }

        
    }

    const login=(event)=>{
        const body={
            password:formdata.password,
        }
        if(signupdone){
           setsignupdone(false)
           if(formdata.mobile!==''){
              body.number=formdata.mobile
           }else{
              body.email=formdata.email
           }
        }else{
            event.preventDefault()
            const emailregex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const mobileregex=/^\d{10}$/
            if(mobileregex.test(formdata.emailnumber)){
                body.number=formdata.emailnumber
            }else if(emailregex.test(formdata.emailnumber)){
                body.email=formdata.emailnumber
            }
        }

        if(body.email||body.number){
            Login(body)
        }else{
            let message='Invalid Email/Mobile'
            seterrormessage(message)
            setTimeout(()=>{
                seterrormessage('')
            },5000)
        }
    }
    
    const handlefilechange=(e)=>{
          let filename=document.getElementById("filename").value
          let idxDot=filename.lastIndexOf(".")+1
          let extfile=filename.substr(idxDot,filename.length).toLowerCase()
          if(extfile=='jpg'||extfile=='png'||extfile=='jpeg'){
            setfile(e.target.files[0])
          }else{
            if(document.getElementById("filename").value!=""){
                document.getElementById("filename").value = ""
                let message='Only jpg/jpeg and png files are Allowed'
                seterrormessage(message)
                setTimeout(()=>{
                    seterrormessage('')
                },5000)
            }
            
          }
    }

    const handlechange=(e)=>{
         setformdata((prev)=>({
            ...prev,
            [e.target.name]:e.target.value
         }))

        if(e.target.name=='password'||e.target.name=='confirmpassword'){
            let pass,confirmpass
            const regex=/^.{6,10}$/
            if(e.target.name=='password'){
                pass=e.target.value 
                confirmpass=formdata.confirmpassword
            }else{
                pass=formdata.password
                confirmpass=e.target.value
            }
            pass!==confirmpass?setpassalert(true):setpassalert(false)
            !regex.test(e.target.value)?setpass2alert(true):setpass2alert(false)
        }

        // if(e.target.name=='email'){
            
        // }

        if(e.target.name=='number'){
           const regex=/^\d{10}$/
           {regex.test(e.target.value)?setmobilealert(false):setmobilealert(true)}
        }
    }
    return(
        <>
         <div className="flex h-screen items-center justify-center flex-col">
         <div className="text-4xl flex text-orange-500 pb-20"><i className="text-white p-1 text-bold mr-1 text-2xl bg-black rounded"><FontAwesomeIcon icon={faSwatchbook}/></i> Auth</div>
        {!bool?<>
        {/* Login Form*/}
        <form onSubmit={login} className="pb-4 flex flex-col">
            <div>
                {errormessage!=''?errormessage:' '}
            </div>
            <input 
                className="p-1 border rounded hover:border-orange-500 mb-2 focus:ring focus:ring-orange-500" 
                type='text' 
                name="emailnumber"
                placeholder='Email/Mobile' 
                value={formdata.emailnumber} 
                onChange={handlechange}
                required    
            /> 
            <input 
                className="p-1 border rounded hover:border-orange-500 mb-2 focus:ring focus:ring-orange-500" 
                type='password' 
                name="password"
                placeholder='Password' 
                value={formdata.password} 
                onChange={handlechange}
                required 
            />
            <button type="submit">Login</button>
        </form>
        

        <div className="pt-2 ">New User?<span className="text-blue-500 cursor-pointer" onClick={()=>{
            setbool(!bool) 
            setformdata((prev)=>({
                ...prev,
                ['email']:'',
                ['number']:'',
                ['name']:'',
                ['password']:'',
                ['confirmpassword']:'',
            }))
            }}> Signup</span>
        </div>
        </>:
        <>
        {/* Signup Form */}
        <form onSubmit={signup} className="pb-4 flex flex-col "> 
            <div>
                {errormessage!=''?errormessage:' '}
            </div>
            <input 
                className={`p-1 border rounded ${emailalert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring `} 
                type='email' 
                name="email"
                placeholder='Email' 
                value={formdata.email} 
                onChange={handlechange} 
            />
            <input 
                className={`p-1 border rounded ${mobilealert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring`}
                type='text' 
                name="number"
                placeholder='Mobile' 
                value={formdata.number} 
                onChange={handlechange} 
            />
            <input 
                className="p-1 border rounded hover:border-orange-500 mb-2 focus:ring focus:ring-orange-500" 
                type='text' 
                name="name"
                placeholder='Name' 
                value={formdata.name} 
                onChange={handlechange} 
                required
            />
            <div className="flex items-center justify-center p-1 mb-2">
                <label>Profile Image: </label>
                <input 
                    className=""
                    name="file"
                    type="file"
                    id="filename"
                    accept="image/*"
                    onChange={handlefilechange}
                    required
                />
            </div>
            <input 
                className={`p-1 border rounded ${passalert||pass2alert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring`} 
                type='password'
                name="password" 
                placeholder='Password' 
                value={formdata.password} 
                onChange={handlechange}
                required 
            />
            <input 
                className={`p-1 border rounded ${passalert||pass2alert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring`} 
                type='password' 
                name="confirmpassword"
                placeholder='Confirm Password' 
                value={formdata.confirmpassword} 
                onChange={handlechange}
                required 
            />
            {/* <select className="p-1 border rounded hover:border-orange-500 mb-2 focus:ring focus:ring-orange-500"  value={role} onChange={(e)=>setrole(e.target.value)}>
                <option className="p-1 text-base border rounded hover:border-orange-500 mb-2" value='user' >Learner</option>
                <option className="p-1 border rounded hover:border-orange-500 mb-2" value='instructor'>Instructor</option>
            </select> */}
            <button type="submit" className="">Sign Up</button>
        </form>
        
        <div className="pt-2">Already User?<span className="text-blue-500 cursor-pointer" onClick={()=>{
            setbool(!bool) 
            setformdata((prev)=>({
                ...prev,
                ['email']:'',
                ['number']:'',
                ['name']:'',
                ['password']:'',
                ['confirmpassword']:'',
            }))
            }}> Login</span>
        </div>
        </>}
        </div>
        </>
    )
}

export default Auth