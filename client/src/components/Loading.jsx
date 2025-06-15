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
   <div className="flex justify-center items-center h-[80vh]">
    <div className="animate-spin rounded-full h-1/4 w-1/4 border-2 border-t-primary"></div>
   </div>
  )
}

export default Loading