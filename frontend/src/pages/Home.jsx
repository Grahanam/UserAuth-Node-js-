import { useContext, useEffect,useState } from "react"
import MyContext from "../myContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faMultiply, faPen, faRightFromBracket, faTrash } from "@fortawesome/free-solid-svg-icons"
const VITE_BASE_URL=import.meta.env.VITE_BASE_URL


const Home=({Logout})=>{
    const {token,id,name}=useContext(MyContext)
    const [user,setuser]=useState({})
    const [formdata,setformdata]=useState({
        name:'',
        email:'',
        number:''
    })
    const [emailalert,setemailalert]=useState(false)
    const [mobilealert,setmobilealert]=useState(false)
    const [namealert,setnamealert]=useState(false)
    const [errormessage,seterrormessage]=useState('')
    // const [username,setusername]=useState('')
    // const [email,setemail]=useState('')
    // const [number,setnumber]=useState('')
    
    const [edit,setedit]=useState(false)
    const [file,setfile]=useState(null)



    const singleUser=()=>{
        console.log(id)
        fetch(`${VITE_BASE_URL}/${id}`,{
            method:"GET",
            headers:{
                "Authorization":`Bearer ${token}`,
                "Accept":"application/json",
                "Content-Type":"application/json"
            },
        }).then(response=>response.json())
        .then((response)=>{
            console.log(response.user)
            setuser(response.user)
            setformdata((prev)=>({
                ...prev,
                ['name']:response.user?.name
            }))
            // setusername(response.user.name)
        })
        .catch((err)=>{
            console.log(err)
            alert('Internal Server Error')
        })
    }
   


    const updateuser=()=>{
        const body=new FormData()
        if(emailalert||mobilealert||namealert){
            let message=''
            {emailalert?message+='Invalid Email !':''}
            {mobilealert?message+='[Invalid Mobile !] ':''}
            {namealert?message+='[Provide Name !] ':''}
            seterrormessage(message)
            setTimeout(()=>{
                seterrormessage('')
            },5000)
        }else{
            if(!user.email&&formdata.email!==''){
                body.append('email',formdata.email)
            }
            if(!user.mobile&&formdata.number!==''){
                body.append('number',formdata.number)
            }
            if(file){
                body.append('file',file)
            }

            body.append('name',formdata.name)

            fetch(`${VITE_BASE_URL}/${id}`,{
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
                    // setformdata((prev)=>({
                    //     ...prev,
                    //     ['name']:user.name,
                    //     ['mobile']:'',
                    //     ['email']:''
                    // }))
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

    const deleteUser=()=>{
        if(confirm("Delete Account.Are you sure?")==true){
            fetch(`${VITE_BASE_URL}/${id}`,{
                method:"DELETE",
                headers:{
                    "Authorization":`Bearer ${token}`,
                    "Accept":"application/json",
                },
            }).then(response=>response.json())
            .then((response)=>{
                    Logout()
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

        if(e.target.name=='number'){
            const regex=/^\d{10}$/
            {regex.test(e.target.value)||e.target.value==''?setmobilealert(false):setmobilealert(true)}
        }
   }

    useEffect(()=>{
        if(id!==''){
            singleUser()
        }
    },[id])
    return(
        <>
        <div className="max-w-[1240px] min-w-full md:min-w-[80%] lg:min-w-[60%] flex flex-col justify-start">
        <div>
                {errormessage!=''?errormessage:' '}
        </div>
        <div className="flex flex-col items-center justify-center border p-2 rounded">
        <div className="flex justify-between w-full">
            <button className="bg-red-500" onClick={deleteUser}><i><FontAwesomeIcon icon={faTrash}/></i></button>
            <button onClick={Logout}><i><FontAwesomeIcon icon={faRightFromBracket}/></i></button>
        </div>
        <div>ID:{id}</div>
        <div className="flex items-center justify-center rounded-full overflow-hidden w-52 h-52 border border-blue-500 border-4 ">
        {user.image?<>
            <img className="" src={user.image?.url}/>
        </>:<></>}
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
                {user.name&&!user.email?
                    <input 
                        className={`p-1 border rounded ${emailalert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring `}
                        type="email" 
                        placeholder="Email" 
                        name='email'
                        value={formdata.email} 
                        onChange={handlechange}
                    /> 
                :<></>} 
                {user.name&&!user.mobile?
                <input 
                    className={`p-1 border rounded ${mobilealert?'border-red-500 focus:ring-red-500':'hover:border-orange-500 focus:ring-orange-500'} mb-2 focus:ring `}
                    type="text" 
                    placeholder="Mobile" 
                    name="number"
                    value={formdata.number} 
                    onChange={handlechange}
                />
                :<></>}  
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
                        setemailalert(false)
                        setmobilealert(false)  
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
        <div className="mt-8 ">
            <div className="flex flex-col p-2">
                <span className="px-1">{user.name}</span>
                <span className="px-1">{user.email}</span>
                <span className="px-1">{user.mobile}</span>
            </div>
            <div className="flex w-full items-center justify-end">
                <button onClick={()=>setedit(!edit)}><i><FontAwesomeIcon icon={faPen}/></i></button>
            </div>
            
        </div>
        }
        </div>
        </div>
        </>
    )
}

export default Home