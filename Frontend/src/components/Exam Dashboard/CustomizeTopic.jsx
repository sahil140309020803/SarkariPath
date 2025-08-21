import React, { act, useContext } from 'react'
import { AppContent } from '../../context/AppContext';
import { RxCross2 } from "react-icons/rx";
import { BsArrowLeft } from "react-icons/bs";

const CustomizeTopic = () => {
    const { activeSubject, setActiveSubject, setTopicList, topicList, activeTopic, setActiveTopic, showCustomTopic, setShowCustomTopic, difficulty, setDifficulty, setShowTestGenerate, showTestGenerate } = useContext(AppContent);

    const handleCancel = () => {
        setShowCustomTopic(prev => !prev);
        setActiveTopic(null);
        setActiveSubject(null);
    }
    const handleTest = (diff) => {
        setDifficulty(diff);
        setShowTestGenerate(prev => !prev);
        setShowCustomTopic(prev => !prev);
    }

    return (
        <div>
            {/* Wrapper */}
            <div onClick={() => handleCancel()} className='fixed top-0 left-0 right-0 bottom-0 z-2 bg-black opacity-50'></div>
            <div className='fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-3 flex flex-col bg-white w-[30rem] rounded-xl'>
                <div className='flex justify-between items-center p-4 border-b border-gray-400'>
                    <div className='text-lg font-medium '>Customize {activeSubject}</div>
                    <RxCross2 className='hover:text-black text-gray-500 cursor-pointer text-xl' onClick={() => handleCancel()} />
                </div>
                {/* View Port */}
                <div className='p-4 relative overflow-hidden'>
                    {/* Topics */}
                    <div className={`relative flex flex-col gap-2 ${activeTopic ? '-translate-x-[100rem]' : ''} transition-all duration-500 ease-in-out `}>
                        <div className='text-gray-900'>First, select a topic for your test.</div>
                        <div className='flex flex-col gap-3 max-h-[25rem] p-2 overflow-y-scroll'>
                            {topicList.map((topic, index) => {
                                return (
                                    <div onClick={() => setActiveTopic(topic)} key={index} className='border border-gray-300 cursor-pointer p-3 rounded-[8px] hover:bg-blue-50 hover:outline outline-blue-400 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5'>{topic}</div>
                                )
                            })}
                        </div>
                    </div>
                    {/* Difficulty */}
                    <div className={`${activeTopic ? '' : '-translate-x-[100rem]'} absolute top-4 left-4 transition-all duration-500 ease-in-out flex flex-col gap-4 p-2`}>
                        <div onClick={() => setActiveTopic(null)} className='text-blue-700 font-medium text-[17px] flex items-center gap-3 cursor-pointer'>
                            <BsArrowLeft className='text-xl' />
                            <div>Back to Topics</div>
                        </div>
                        <div className='flex flex-col gap-4 p-2 pr-4'>
                            <div className='text-gray-800'>Great! Now choose a difficulty level for <span className='text-black font-semibold'>{activeTopic}</span>.</div>
                            <div onClick={() => handleTest('Easy')} className='border rounded-[8px] text-center p-3 font-bold text-[17px] bg-green-50 text-green-700 border-green-400 cursor-pointer hover:bg-green-100 hover:outline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl'>Easy</div>
                            <div onClick={() => handleTest('Medium')} className='border rounded-[8px] text-center p-3 font-bold text-[17px] bg-yellow-50 text-yellow-700 border-yellow-400 cursor-pointer hover:bg-yellow-100 hover:outline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl'>Medium</div>
                            <div onClick={() => handleTest('Hard')} className='border rounded-[8px] text-center p-3 font-bold text-[17px] bg-red-50 text-red-700 border-red-400 cursor-pointer hover:bg-red-100 hover:outline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl'>Hard</div>
                        </div>
                    </div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}

export default CustomizeTopic;