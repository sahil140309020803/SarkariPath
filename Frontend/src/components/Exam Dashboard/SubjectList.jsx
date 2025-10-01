import React from 'react'
import { useContext } from 'react';
import { IoIosArrowForward } from "react-icons/io";
// import { AppContent } from '../../context/AppContext';
import { useState } from 'react';
import { useExam } from '../../context/ExamContext';

const SubjectList = () => {
    // const { isExamDataFetched, showDifficulty, setShowDifficulty, setActiveSubject, activeSubject, setTopicList, topicList, difficulty, setDifficulty, showCustomTopic, setShowCustomTopic } = useContext(AppContent);

    const {
    isExamDataFetched, setShowDifficulty, setActiveSubject, setTopicList,
    setDifficulty,
     setShowCustomTopic
} = useExam();

    const [subjectName, setSubjectName] = useState(null);
    const Subjects = isExamDataFetched?.Subjects;

    const handleClick = (subName) => {
        setSubjectName(prevActive => prevActive === subName ? null : subName);
    }
    const handleTest = (subj) => {
        setDifficulty(null);
        setActiveSubject(subj);
        setShowDifficulty(prev => !prev);
    }
    const handleCustomTopic = (subjectName, topics) => {
        setDifficulty(null);
        setShowCustomTopic(prev => !prev);
        setActiveSubject(subjectName);
        setTopicList(topics);
    }
    return (
        <div className='w-full h-[40rem] flex flex-col gap-4'>
            {Subjects.map((subject, index) => {
                const isActive = subjectName === subject[1];
                return (
                    <div key={index} className='bg-white p-2 rounded-xl shadow-cyan-900 shadow-xs hover:-translate-y-1 transition-all duration-500 hover:shadow'>
                        <div onClick={() => handleClick(subject[1])} className='w-full flex justify-between items-center p-4 cursor-pointer hover:bg-blue-50 rounded-xl'>
                            <div className='flex justify-center items-center gap-4'>
                                <div className='size-10 bg-blue-100 flex justify-center items-center text-xl rounded-[6px]'>{subject[0]}</div>
                                <div className='text-lg font-semibold'>{subject[1]}</div>
                            </div>
                            <div className={`text-xl ${isActive ? 'rotate-90' : ''} transition-transform duration-500`}><IoIosArrowForward /> </div>
                        </div>
                        <div className={`overflow-hidden transition-[max-height] duration-400 ease-in-out ${isActive ? 'max-h-screen' : 'max-h-0'}`}>
                            <div className='p-4 flex flex-col gap-3'>
                                <div className='flex justify-between '>
                                    <div>Practice tests by topic and difficulty.</div>
                                    <div className='flex justify-between items-center gap-10 text-gray-700'>
                                        <div>✅ 15 Questions</div>
                                        <div>⌛ 20 Minutes</div>
                                    </div>
                                </div>
                                <div className='flex justify-between items-center gap-4'>
                                    <div onClick={() => handleTest(subject[1])} className='grow text-center p-[6px] rounded-[8px] cursor-pointer bg-blue-500 text-white font-medium hover:bg-blue-700 transition-colors duration-100'>Start Test</div>
                                    <div onClick={() => handleCustomTopic(subject[1], subject[2])} className='text-center p-[6px] pl-3 pr-3 rounded-[8px] cursor-pointer font-medium bg-gray-200 hover:bg-gray-300 transition-colors duration-100'>Customize Topics</div>
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