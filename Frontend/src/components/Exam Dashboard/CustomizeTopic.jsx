import React, { act, useContext } from 'react'
// import { AppContent } from '../../context/AppContext';
import { RxCross2 } from "react-icons/rx";
import { BsArrowLeft } from "react-icons/bs";
import { useExam } from '../../context/ExamContext';

const CustomizeTopic = () => {
    const { activeSubject, setActiveSubject, setTopicList, topicList, activeTopic, setActiveTopic, showCustomTopic, setShowCustomTopic, difficulty, setDifficulty, setShowTestGenerate, showTestGenerate } = useExam();



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
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
            {/* Backdrop Wrapper */}
            <div onClick={() => handleCancel()} className='absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity'></div>
            
            {/* Modal Content */}
            <div className='relative z-[110] flex flex-col bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden'>
                <div className='flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'>
                    <div className='text-lg font-bold text-slate-800 dark:text-white'>Customize {activeSubject}</div>
                    <button className='p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors' onClick={() => handleCancel()}>
                        <RxCross2 className='size-5'/>
                    </button>
                </div>
                {/* View Port */}
                <div className='p-5 relative overflow-hidden'>
                    {/* Topics */}
                    <div className={`relative flex flex-col gap-3 ${activeTopic ? '-translate-x-[100rem]' : ''} transition-all duration-500 ease-in-out `}>
                        <div className='text-sm font-medium text-slate-600 dark:text-slate-400'>First, select a topic for your test.</div>
                        <div className='flex flex-col gap-3 max-h-[60vh] p-1 overflow-y-auto custom-scrollbar'>
                            {(!topicList || topicList.length === 0) ? (
                                <div className='py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center'>
                                    <div className='text-3xl mb-3'>📚</div>
                                    <div className='text-sm font-medium'>No custom topics available.</div>
                                    <div className='text-xs mt-1'>Topics have not been mapped for this subject yet.</div>
                                </div>
                            ) : (
                                topicList.map((topic, index) => {
                                    return (
                                        <div onClick={() => setActiveTopic(topic)} key={index} className='border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 cursor-pointer p-4 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-700 dark:hover:text-indigo-400 font-semibold transition-all duration-300 ease-in-out hover:shadow-sm hover:-translate-y-0.5'>{topic}</div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                    {/* Difficulty */}
                    <div className={`${activeTopic ? '' : '-translate-x-[100rem]'} absolute inset-0 z-10 bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out flex flex-col gap-4 p-5`}>
                        <div onClick={() => setActiveTopic(null)} className='text-indigo-600 dark:text-indigo-400 font-bold text-[15px] flex items-center gap-2 cursor-pointer hover:underline w-fit'>
                            <BsArrowLeft className='text-xl' />
                            <div>Back to Topics</div>
                        </div>
                        <div className='flex flex-col gap-4 mt-2'>
                            <div className='text-slate-600 dark:text-slate-400 text-sm font-medium'>Great! Now choose a difficulty level for <span className='text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded'>{activeTopic}</span>.</div>
                            
                            <div onClick={() => handleTest('Easy')} className='border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-center p-4 font-bold text-[17px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-sm'>Easy</div>
              
                            <div onClick={() => handleTest('Medium')} className='border border-amber-200 dark:border-amber-500/30 rounded-xl text-center p-4 font-bold text-[17px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-sm'>Medium</div>
                            
                            <div onClick={() => handleTest('Hard')} className='border border-rose-200 dark:border-rose-500/30 rounded-xl text-center p-4 font-bold text-[17px] bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all duration-300 ease-in-out hover:-translate-y-0.5 shadow-sm'>Hard</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomizeTopic;