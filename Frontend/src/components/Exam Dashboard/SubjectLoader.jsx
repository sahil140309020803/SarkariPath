import React from 'react'

const SubjectLoader = () => {
    const array = [1,2,3,4,5]
  return (
    <div className='w-full h-full animate-pulse'>
        {array.map((_, index) => (
            <div className='flex justify-between items-center pt-5 pb-5 border-b border-gray-200'>
                <div className='flex justify-center items-center gap-2'>
                    <div className='size-5 bg-gray-300 rounded-[6px]'></div>
                    <div className='w-[15rem] h-5 bg-gray-300 rounded-[6px]'></div>
                </div>
                <div className='w-10 h-5 bg-gray-300 rounded-[6px]'></div>
            </div>
        ))}
    </div>
  )
}

export default SubjectLoader;