import React from 'react'
import { useContext } from 'react';
import { IoIosArrowForward } from "react-icons/io";
// import { AppContent } from '../../context/AppContext';
import { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import axios from 'axios';

const SubjectList = () => {
    // const { isExamDataFetched, showDifficulty, setShowDifficulty, setActiveSubject, activeSubject, setTopicList, topicList, difficulty, setDifficulty, showCustomTopic, setShowCustomTopic } = useContext(AppContent);

    const {
    isExamDataFetched, setShowDifficulty, setActiveSubject, setTopicList,
    setDifficulty,
    setShowCustomTopic, backend_url
} = useExam();

    const [subjectName, setSubjectName] = useState(null);
    const Subjects = isExamDataFetched?.Subjects;

    const handleClick = (subName) => {
        setSubjectName(prevActive => prevActive === subName ? null : subName);
    }
    const handleTest = (subj) => {
        setDifficulty(null);
        setActiveTopic(null); // Clear specific topic when starting a full subject test
        setActiveSubject(subj);
        setShowDifficulty(prev => !prev);
    }
    const handleCustomTopic = async (subjectName) => {
        setDifficulty(null);
        setActiveSubject(subjectName);
        try {
            const { data } = await axios.get(`${backend_url}/api/exams/${isExamDataFetched.ExamId}/subjects/${subjectName}/topics`, { withCredentials: true });
            if(data.success && data.topics) {
                setTopicList(data.topics);
            } else {
                setTopicList([]);
            }
        } catch(err) {
            console.error("Failed to fetch topics:", err);
            setTopicList([]);
        }
        setShowCustomTopic(prev => !prev);
    }
    return (
        <div className='w-full h-[40rem] flex flex-col gap-4'>
            {Subjects.map((subject, index) => {
                const isActive = subjectName === subject;
                return (
                    <div key={index} className='bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300'>
                        <div onClick={() => handleClick(subject)} className='w-full flex justify-between items-center p-4 cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors rounded-xl'>
                            <div className='flex justify-center items-center gap-4'>
                                <div className='size-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex justify-center items-center text-xl rounded-lg font-bold transition-colors'>{subject[0]}</div>
                                <div className='text-lg font-bold text-slate-800 dark:text-slate-200 transition-colors'>{subject}</div>
                            </div>
                            <div className={`text-xl text-slate-500 dark:text-slate-400 ${isActive ? 'rotate-90' : ''} transition-transform duration-500`}><IoIosArrowForward /> </div>
                        </div>
                        <div className={`overflow-hidden transition-[max-height] duration-400 ease-in-out ${isActive ? 'max-h-screen' : 'max-h-0'}`}>
                            <div className='p-4 pt-2 flex flex-col gap-4'>
                                <div className='flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 border-t border-slate-100 dark:border-slate-700/50 pt-4'>
                                    <div className='text-sm font-medium text-slate-600 dark:text-slate-400'>Practice tests by topic and difficulty.</div>
                                    <div className='flex justify-between items-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400'>
                                        <div className='flex items-center gap-1'><span className='text-emerald-500'>✅</span> 15 Questions</div>
                                        <div className='flex items-center gap-1'><span>⌛</span> 20 Minutes</div>
                                    </div>
                                </div>
                                <div className='flex justify-between items-center gap-4 mt-2'>
                                    <div onClick={() => handleTest(subject)} className='grow text-center p-[8px] rounded-xl cursor-pointer bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors duration-200 shadow-sm'>Start Test</div>
                                    <div onClick={() => handleCustomTopic(subject)} className='text-center p-[8px] pl-4 pr-4 rounded-xl cursor-pointer font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 border border-slate-200 dark:border-slate-600'>Customize Topics</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default SubjectList;