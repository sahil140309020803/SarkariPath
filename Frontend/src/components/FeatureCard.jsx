import React from 'react'

const FeatureCard = ({ icon, title, content }) => {
  return (
    <div className='border-t border-t-blue-700 group w-[13rem] h-[14rem] flex flex-col justify-center items-center gap-2 p-4 rounded-xl shadow-xl bg-white shadow-gray-300 hover:shadow-gray-400  cursor-pointer relative hover:-translate-y-1 transition-all duration-500 ease-in-out'>
        <div className='rounded-full absolute top-0 right-0 m-3 bg-radial-[at_50%_75%] from-sky-500 via-blue-400 to-indigo-900 to-90% p-0.5 transition-transform duration-1000 ease-in-out group-hover:[transform:rotate(360deg)]'>🤖</div>
        <div className='animate-bounce p-2 rounded-full flex justify-center items-center bg-blue-600 transition-transform duration-5000 ease-in-out]'>
            {icon}
        </div>
        <div className='font-medium text-[17px]'>
            {title}
        </div>
        <div className='text-gray-600 text-center'>
            {content}
        </div>
    </div>
  )
}

export default FeatureCard;