import React from 'react'

const AboutLoader = () => {
    const array = [1,2,3]
  return (
    <div className='w-full h-full animate-pulse'>
        {array.map((_, index) => (
            <div className='flex flex-col justify-center gap-5 pb-4 pt-4 border-b border-gray-200'>
                <div className='text-2xl text-gray-300 bg-gray-300 w-fit pr-10 rounded-[6px]'>About The Exam</div>
                <div className='text-gray-300 bg-gray-300 p-2 rounded-xl'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum quam voluptatem cumque deserunt expedita nulla fuga vero, neque, adipisci ex assumenda molestias veritatis architecto id tempore labore numquam? Temporibus, enim.
                </div>
            </div>
        ))}
    </div>
  )
}

export default AboutLoader;