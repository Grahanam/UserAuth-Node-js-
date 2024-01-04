import { useContext } from "react"
import { Navigate } from "react-router-dom"
import MyContext from "../myContext"




const AuthRoute=({children})=>{
    const {token,role}=useContext(MyContext)
    return(
        <>
            {token&&role!==''?<>
                  {role=='admin'?<Navigate to="/admin"/>:<Navigate to="/"/>}
               </>
            :
               children
            }
        </>
    )

}

export default AuthRoute