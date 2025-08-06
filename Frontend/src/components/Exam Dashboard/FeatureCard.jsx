import React, { useContext } from 'react'
import { AppContent } from '../../context/AppContext'
import AITopicSumm from './AITopicSumm';

const FeatureCard = ({ icon, title, desc, onClick }) => {
    const { AItopicSummarizer,setAItopicSummarizer } = useContext(AppContent);
    
  return (
    <>
        <div onClick={onClick} className='flex flex-col gap-4 p-5 justify-start w-[14.2rem] h-[12rem] rounded-xl bg-linear-to-bl from-sky-100 to-fuchsia-100 shadow-xl cursor-pointer hover:-translate-y-2 hover:shadow-2xl  transition-all duration-500 '>
            <div className='size-11 border flex justify-center items-center rounded text-2xl text-white bg-linear-to-t from-sky-500 to-[#c57cd0] font-medium'>
                <div className='animate-pulse'>{icon}</div>
            </div>
            <div className='flex flex-col'>
                <div className='text-lg font-medium'>{title}</div>
                <div>{desc}</div>
            </div>      
        </div>
       
    </>
  )
}

export default FeatureCard;