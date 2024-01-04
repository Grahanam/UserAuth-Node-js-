import { useContext, useState } from "react"
import MyContext from "../myContext"
import { Navigate } from "react-router-dom"
import Cookies from "universal-cookie"



const ProtectedRoute=({children})=>{
    const cookies=new Cookies()
    const {token}=useContext(MyContext)
    // const [token,settoken]=useState(cookies.get('TOKEN')?cookies.get('TOKEN'):null)
    return(
        <>
            {!token?<Navigate to="/auth"/>:children}
        </>
    )
}

export default ProtectedRoute