import { useEffect, useState } from 'react'

import './App.css'
import MyContext, {MyProvider} from './myContext'
import { Routes,Route, useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie'
import Auth from './pages/Auth'
import Home from './pages/Home'
import AuthRoute from './authroute/authRoute'
import ProtectedRoute from './authroute/protectedRoute'
import {jwtDecode} from "jwt-decode"
import Admin from './pages/Admin'
import CreateAdmin from './pages/CreateAdmin'
const VITE_BASE_URL=import.meta.env.VITE_BASE_URL

function App() {
  const cookies=new Cookies()
  const [token,settoken]=useState(cookies.get('TOKEN')?cookies.get('TOKEN'):null)
  const [name,setname]=useState('')
  const [role,setrole]=useState('')
  const [id,setid]=useState('')
  const navigate=useNavigate()

  const handletoken=(Token)=>{
    const decode=jwtDecode(Token)
    if(decode.exp*1000>Date.now()){
      console.log(decode)
      settoken(Token)
      setid(decode.userid)
      setname(decode.user)
      setrole(decode.role)

      {decode.role=='admin'?navigate('/admin',{replace:true}):navigate('/',{replace:true})}
      
    }else{
      cookies.remove('TOKEN')
      settoken(null)
      navigate('/auth',{replace:true})
    }
  }

  const login=(body)=>{
    fetch(`${VITE_BASE_URL}/login`,{
      method:"POST",
      headers:{
          "Accept":"application/json",
          "Content-Type":"application/json"
      },
      body:JSON.stringify(body)
  }).then(response=>response.json())
  .then((response)=>{
      if(response.token){
          console.log(response.token)
          settoken(token)
          cookies.set("TOKEN",response.token,{
              path:"/",
          })
          const Token=response.token
          handletoken(Token)
          
      
      }else{
          alert(response.message)
      }
  })
  .catch((err)=>{
      alert('Internal Server Error')
  })
  }

  const logout=()=>{
    cookies.remove('TOKEN')
    settoken(null)
    setid('')
    setrole('')
    navigate('/auth',{replace:true})
     
  }

  useEffect(()=>{
      if(cookies.get('TOKEN')){
        const Token=cookies.get('TOKEN')
        handletoken(Token)
      }

  },[])

  return (
    <MyContext.Provider value={{token:token,settoken:settoken,id:id,name:name,role:role}}>
      <div className='w-screen h-screen flex items-top justify-center'>
      <Routes>
        <Route path="/auth" element={ <AuthRoute><Auth Login={login} /></AuthRoute>}/>
        <Route path="/"  element={<ProtectedRoute><Home Logout={logout}/></ProtectedRoute>}/>
        <Route path="/admin"  element={<ProtectedRoute><Admin Logout={logout}/></ProtectedRoute>}/>
        {/* <Route path="/createadmin"  element={<ProtectedRoute><CreateAdmin Logout={logout}/></ProtectedRoute>}/> */}
      </Routes>
      </div>
    </MyContext.Provider>
  )
}

export default App
