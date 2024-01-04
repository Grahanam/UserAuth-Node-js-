
import { useContext, useEffect,useState } from "react"
import MyContext from "../myContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAdd, faCheck, faEye, faMultiply, faPen, faRightFromBracket, faTrash, faUser } from "@fortawesome/free-solid-svg-icons"
const VITE_BASE_URL=import.meta.env.VITE_BASE_URL



const Admin=({Logout})=>{
    
    const {token,id,name}=useContext(MyContext)
    const [user,setuser]=useState({})
    const [users,setusers]=useState([])
    const [admins,setadmins]=useState([])
    const [formdata,setformdata]=useState({
        name:'',
        password:'',
        confirmpassword:''
    })
    const [emailalert,setemailalert]=useState(false)
    const [mobilealert,setmobilealert]=useState(false)
    const [namealert,setnamealert]=useState(false)
    const [passalert,setpassalert]=useState(false)
    const [pass2alert,setpass2alert]=useState(false)
    const [errormessage,seterrormessage]=useState('')
    // const [username,setusername]=useState('')
    // const [email,setemail]=useState('')
    // const [number,setnumber]=useState('')
    
    const [edit,setedit]=useState(false)
    const [create,setcreate]=useState(false)
    const [file,setfile]=useState(null)


    //Get All User
    const getUser=()=>{
        console.log(id)
        fetch(`${VITE_BASE_URL}/admin/user`,{
            method:"GET",
            headers:{
                "Authorization":`Bearer ${token}`,
                "Accept":"application/json",
                "Content-Type":"application/json"
            },
        }).then(response=>response.json())
        .then((response)=>{
            console.log(response.user)
            if(response.user){
                setusers(response.user)
            }
            if(response.admin){
                setadmins(response.admin)
            } 
        })
        .catch((err)=>{
            console.log(err)
            alert('Internal Server Error')
        })
    }

    const createadmin=(event)=>{
        event.preventDefault()
        
        if(namealert||emailalert||mobilealert||passalert||pass2alert){
            let message=''
            {namealert?message+='Provide Name ':''}
            {emailalert?message+='Invalid Email ':''}
            {passalert?message+='[Password Not Matched !] ':''}
            {pass2alert?message+='[Password min:6 & max:10 !]':''}
            seterrormessage(message)
            setTimeout(()=>{
                seterrormessage('')
            },5000)
        }else{
            const data=new FormData()
            if(formdata.email!=''){
                data.append('email',formdata.email)
            }
            data.append('name',formdata.name)
            data.append('password',formdata.password)
            
            fetch(`${VITE_BASE_URL}/admin/createadmin`,{
                method:"POST",
                headers:{
                    "Authorization":`Bearer ${token}`,
                    "Accept":"application/json",
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({email:formdata.email,name:formdata.name,password:formdata.password})
            }).then(response=>response.json())
            .then((response)=>{
                if(response.id){
                    console.log(response.id)
                    alert(response.message)
                    setformdata((prev)=>({
                        ...prev,
                        ['name']:'',
                        ['password']:'',
                        ['confirmpassword']:'',
                        ['email']:''
                    }))
                    getUser()
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


    //Update User
    const updateuser=()=>{
        const body=new FormData()
        if(namealert){
            let message=''
            {namealert?message+='[Provide Name !] ':''}
            seterrormessage(message)
            setTimeout(()=>{
                seterrormessage('')
            },5000)
        }else{
            if(file){
                body.append('file',file)
            }
            body.append('name',formdata.name)

            fetch(`${VITE_BASE_URL}/${user._id}`,{
                method:"PUT",
                headers:{
                    "Authorization":`Bearer ${token}`,
                    "Accept":"application/json",
                },
                body:body
            }).then(response=>response.json())
            .then((response)=>{
                console.log(response.data)
                if(response.data){
                    setuser(response.data)
                    getUser()
                    setedit(!edit)
                }else{
                    alert(response.message)
                }
            })
            .catch((err)=>{
                console.log(err)
                alert('Internal Server Error')
            })

        }
    }
    
    //Delete User
    const deleteUser=(User)=>{
        if(confirm("Want to Delete this User?")==true){
            fetch(`${VITE_BASE_URL}/${User._id}`,{
                method:"DELETE",
                headers:{
                    "Authorization":`Bearer ${token}`,
                    "Accept":"application/json",
                },
            }).then(response=>response.json())
            .then((response)=>{
                    if(User._id==user._id){
                        setuser({})
                    }
                    alert(response.message)
                    getUser()
            })
            .catch((err)=>{
                console.log(err)
                alert('Internal Server Error')
            })

        }else{

        }
        
        
    }
    
    const handlechange=(e)=>{
        setformdata((prev)=>({
           ...prev,
           [e.target.name]:e.target.value
        }))
        
        if(e.target.name=='name'){ 
           e.target.value==''?setnamealert(true):setnamealert(false)    
        }
        if(e.target.name=='email'){
            const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            {regex.test(e.target.value)?setemailalert(false):setemailalert(true)}    
        }
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
   }

   const startupdate=(user)=>{
       if(create){
        setcreate(!create)
       }
       setuser(user)
       setformdata((prev)=>({
        ...prev,
        ['name']:user.name,
        ['mobile']:'',
        ['email']:''
    }))
    //    setedit(!edit)
   }

    useEffect(()=>{

        getUser()
        
    },[])
    return(
        <>
        <div className="max-w-[1240px] min-w-full md:min-w-[80%] lg:min-w-[60%] flex flex-col justify-start">
        <div className="flex justify-between items-center p-1 border rounded">
            Welcome,{name}
            <button 
                onClick={Logout}>
                <i><FontAwesomeIcon icon={faRightFromBracket}/></i> 
                Logout
            </button> 
        </div>
        {/* <div>{name}</div> */}
        <div className="flex justify-between items-center p-1 ">
            <button onClick={()=>{
                if(edit){
                    setedit(!edit)
                }
                setformdata((prev)=>({
                    ...prev,
                    ['name']:'',
                    ['mobile']:'',
                    ['email']:'',
                    ['password']:'',
                    ['confirmpassword']:''
                }))
                setnamealert(false)
                setemailalert(false)
                setpass2alert(false)
                setpassalert(false)
                setcreate(!create)
                setuser({})
            }}>
                {create?<i><FontAwesomeIcon icon={faMultiply}/> Cancel</i>:<i><FontAwesomeIcon icon={faAdd}/> Create New Admin</i>}
                
            </button> 
        </div>
        <div>
                {errormessage!=''?errormessage:' '}
        </div>
       {create?<>
          <form onSubmit={createadmin} className="flex flex-col items-center justify-center border p-2 rounded">
            <div className="pb-1">Create New Admin</div>
            {/* <form  > */}
            <input 
                className={`p-1 border rounded ${emailalert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring `} 
                type='email' 
                name="email"
                placeholder='Email' 
                value={formdata.email} 
                onChange={handlechange} 
            />
            <input 
                className={`p-1 border rounded ${namealert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring `} 
                type='text' 
                name="name"
                placeholder='Name' 
                value={formdata.name} 
                onChange={handlechange} 
                required
            />  
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
            <button type="submit">Submit</button>
            {/* </form> */}
             
          </form>
       
       </>:
       
      
        <div className="flex flex-col items-center justify-center border p-2 rounded">
           
        <div className="flex items-center justify-center rounded-full overflow-hidden w-52 h-52 border border-blue-500 border-4 ">
        {user.image?<>
            <img className="" src={user.image?.url}/>
        </>:<>
           <i className="text-6xl"><FontAwesomeIcon icon={faUser}/></i>
        </>}
        </div>
       
        {edit?
        
        <div className="flex flex-col items-center justify-center">
            
            <div className="flex flex-col items-center justify-center">
                <input
                    className="w-52 my-2"
                    type="file"
                    onChange={(e)=>setfile(e.target.files[0])}
                />
                <input 
                    className={`p-1 border rounded ${namealert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring `}
                    type="text"
                    placeholder="name" 
                    name="name"
                    value={formdata.name} 
                    onChange={handlechange}
                /> 
            </div>
            
            
            <div className="flex w-full justify-between">
            <button onClick={()=>{
                setedit(!edit)
                    setformdata((prev)=>({
                        ...prev,
                        ['name']:user.name,
                        ['mobile']:'',
                        ['email']:''
                    })) 
                        setnamealert(false)
                        // setemailalert(false)
                        // setmobilealert(false)  
                    }
                               
                } 
                className="bg-red-500"
            >
                <i className=" rounded">
                    <FontAwesomeIcon icon={faMultiply}/>
                </i>
            </button>
            <button onClick={updateuser}>
                <i className=" rounded">
                    <FontAwesomeIcon icon={faCheck}/>
                </i>
            </button>

            </div>
        </div> 
        :   
            <>

            {user.name?
            
                <div className="mt-8 ">
                    <div className="flex justify-between w-full">
                        {user.role!=='admin'?
                        <button className="bg-red-500" onClick={()=>deleteUser(user)}><i><FontAwesomeIcon icon={faTrash}/></i></button>
                        :<></>}
                    </div>
            <div className="flex flex-col p-2">
                <span className="px-1">{user._id}</span>
                <span className="px-1">{user.name}</span>
                <span className="px-1">{user.email}</span>
                <span className="px-1">{user.mobile}</span>
            </div>
            
            <div className="flex w-full items-center justify-between">
                
                <button className="bg-red-500" onClick={()=>setuser({})}><i><FontAwesomeIcon icon={faMultiply}/></i></button>
                {user.role!=='admin'?
                    <button onClick={()=>setedit(!edit)}><i><FontAwesomeIcon icon={faPen}/></i></button>
                    :<></>}
            </div>
              </div>
            :<>
               <div>No User Selected</div>
            </>}

            </>
            
            
      
        }
        </div>
        }
        
        <div className="flex flex-col md:flex-row justify-evenly w-full pt-5">
        <div className="md:w-[40%]">
            <div>User</div>
            {users.map((user,index)=>(
                <div className="flex flex-row justify-between items-center border rounded p-1 mb-1" key={index}>
                      <span>{user.name}</span>
                      <div>
                        <button onClick={()=>startupdate(user)}><i><FontAwesomeIcon icon={faEye}/></i></button>
                      </div>
                </div>
            ))}
        </div>
        <div className="md:w-[40%]">
            <div>Admin</div>
            {admins.map((admin,index)=>(
                <div className="flex flex-row justify-between items-center border rounded p-1 mb-1" key={index}>
                      <span>{admin.name}</span>
                      <div>
                        <button onClick={()=>startupdate(admin)}><i><FontAwesomeIcon icon={faEye}/></i></button>
                      </div>
                </div>
            ))}
        </div>
        </div>
        </div>
        </>
    )
}

export default Admin
    