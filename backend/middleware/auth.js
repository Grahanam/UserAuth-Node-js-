const jwt=require('jsonwebtoken')
const secret_key=process.env.SECRET_KEY

const userAuth=(req,res,next)=>{
    
    let token=req.headers['authorization']
    const userid=req.params.id
    console.log(token)
    console.log('userid:',userid)
    if(!token){
        return res.status(500).json({message:'Access Denied'})
    }else{
        if(token.startsWith('Bearer ')){
            token=token.slice(7)
        }
        jwt.verify(token,secret_key,function(error,decoded){
            
              if(error){
                return res.status(500).json({message:'Invalid Token'})
              }else{
                console.log(decoded)
                if(decoded.role=='user'&&decoded.userid==userid){
                    next()
                }else{
                    return res.status(500).json({message:'Access Denied'})
                }
              }

        })

    }

}

const adminAuth=(req,res,next)=>{
    let token=req.headers['authorization']
    if(!token){
        res.status(500).json({message:'Access Denied'})
    }else{
        if(token.startsWith('Bearer ')){
            token=token.slice(7)
        }
        jwt.verify(token,secret_key,function(error,decoded){
            
              if(error){
                res.status(500).json({message:'Invalid Token'})
              }else{
                console.log(decoded)
                if(decoded.role=='admin'){
                    next()
                }else{
                    res.status(500).json({message:'Access Denied'})
                }
              }

        })
    }
}

const useradminAuth=(req,res,next)=>{
    let token=req.headers['authorization']
    if(!token){
        res.status(500).json({message:'Access Denied'})
    }else{
        if(token.startsWith('Bearer ')){
            token=token.slice(7)
        }
        jwt.verify(token,secret_key,function(error,decoded){
            
              if(error){
                res.status(500).json({message:'Invalid Token'})
              }else{
                // console.log(decoded)
                if(decoded.role=='user'&&decoded.userid==req.params.id){
                    next()
                }else if(decoded.role=='admin'){
                    next()
                }else{
                    res.status(500).json({message:'Access Denied'})
                }
              }

        })
    }
}




module.exports={userAuth,adminAuth,useradminAuth}