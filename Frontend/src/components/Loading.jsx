import React from 'react'
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Loading = () => {
  return (
    <div className='fixed top-0 z-10 w-screen h-screen bg-black opacity-60 '>
        <AiOutlineLoading3Quarters className='text-5xl animate-spin relative top-[50%] left-[50%] text-white -translate-x-[-5%] -translate-y-[5%]'/>
    </div>
  )
}

export default Loading;