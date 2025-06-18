import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = ({size='16'}) => {
  const {nextUrl} =useParams()
  const navigate = useNavigate()

  useEffect(()=>{
      if(nextUrl){
        setTimeout(()=>{
          navigate('/'+nextUrl)
        },8000)
      }
  },[])
  return (
    <div className="flex space-x-2">
    <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
  </div>
  
  )
}

export default Loading