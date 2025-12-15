import React, { useContext, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/Exam Dashboard/FeatureCard';
import { FaLayerGroup } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { FaBrain } from "react-icons/fa6";
// import { AppContent } from '../context/AppContext';
import AITopicSumm from '../components/Exam Dashboard/AITopicSumm';
import Section1 from '../components/Exam Dashboard/Section1';
import Section2 from '../components/Exam Dashboard/Section2';
import Section3 from '../components/Exam Dashboard/Section3';
import { useEffect } from 'react';
import Difficulty from '../components/Exam Dashboard/Difficulty';
import CustomizeTopic from '../components/Exam Dashboard/CustomizeTopic';
import TestGenerating from '../components/Exam Dashboard/TestGenerating';

import { useExam } from '../context/ExamContext';

const ExamDash = () => {
  const { exam_cat, exam_name } = useParams();
  // const { AItopicSummarizer, setAItopicSummarizer, activeExamPage, setActiveExamPage, showDifficulty, setShowDifficulty, activeSubject, setActiveSubject, showCustomTopic, setShowTestGenerate, showTestGenerate } = useContext(AppContent);

  // const { isLoggedIn, setIsLoggedIn, isLoading, setIsLoading, userDetails, setUserDetails } = useAuth();
  const {
    setActiveExamPage,
    showDifficulty, 
    showCustomTopic,
    showTestGenerate,
    AItopicSummarizer, setAItopicSummarizer
} = useExam();


  const [activeSection, setActiveSection] = useState(0);

  const removeSlug = (text) => {
    return text.replaceAll('-', ' ');
  }
  useEffect(() => {
    setActiveExamPage(exam_name);
  }, []);
  

  const features = [
    {
      icon: <FaBrain />,
      title: 'AI Topic Summarizer',
      desc: 'Get key insights on any topic.'
    },
    {
      icon: <FaLayerGroup />,
      title: 'Tests Attempted',
      desc: 'Keep up the great work!'
    },
    {
      icon: <GoGraph />,
      title: 'Review History',
      desc: 'Analyze your performance'
    },
  ];

  return (
    <div className='w-full h-full flex flex-col items-center gap-14'>
      <Navbar />
      {/* Exam Heading and Features Card */}
      <div className='flex flex-col gap-12'>
        {/* Exam name Heading */}
        <div className='flex flex-col justify-center items-center gap-1'>
          <div className='font-bold text-4xl bg-radial-[at_50%_75%] from-sky-700 via-blue-600 to-indigo-800 to-90% bg-clip-text text-transparent'>{removeSlug(exam_name)} Exam</div>
          <div className='text-gray-500'>Your path to success starts here.</div>
        </div>
        {/* AI Features Cards */}
        <div className='flex justify-center items-center gap-8 flex-wrap'>
          <FeatureCard icon={features[0].icon} title={features[0].title} desc={features[0].desc} onClick={() => setAItopicSummarizer(true)} />
          <FeatureCard icon={features[1].icon} title={features[1].title} desc={features[1].desc} />
          <FeatureCard icon={features[2].icon} title={features[2].title} desc={features[2].desc} />
        </div>
      </div>
      {AItopicSummarizer && <AITopicSumm examContext={exam_name} />}
      {showDifficulty && <Difficulty />}
      {showCustomTopic && <CustomizeTopic />}
      {showTestGenerate && <TestGenerating />}

      {/* Sections Container */}
      <div className='w-[52rem] flex flex-col gap-8 max-h-full m-2 overflow-hidden'>
        {/* Section Tabs */}
        <div className='border-b border-gray-400 flex justify-around items-center font-medium text-[18px] text-gray-600 gap-5'>
          <div onClick={() => setActiveSection(0)} className={`text-center p-5 grow border-b-2 cursor-pointer transition-colors ${activeSection === 0 ? 'text-blue-600 border-b-blue-600' : 'border-b-transparent hover:border-black hover:text-black'}`}>Mock Test</div>
          <div onClick={() => setActiveSection(1)} className={`text-center p-5 grow border-b-2 cursor-pointer transition-colors ${activeSection === 1 ? 'text-blue-600 border-b-blue-600' : 'border-b-transparent hover:border-black hover:text-black'}`}>Subject Wise Mock Test</div>
          <div onClick={() => setActiveSection(2)} className={`text-center p-5 grow border-b-2 cursor-pointer transition-colors ${activeSection === 2 ? 'text-blue-600 border-b-blue-600' : 'border-b-transparent hover:border-black hover:text-black'}`}>About</div>
        </div>

        {/* Slider Viewport*/}
        <div className='w-full h-full '>
          {/* Slider Track: This element moves */}
          <div 
            className={`flex w-full h-full transition-transform duration-500 ease-in-out translate-x-[-${activeSection * 100}%]`}
            style={{ transform: `translateX(-${activeSection * 100}%)` }}
          >
            {/* Slide 1 */}
            <div className='min-w-full h-full flex justify-center items-center'>
              <Section1 />
            </div>
            {/* Slide 2 */}
            <div className='min-w-full h-full flex justify-center items-center'>
              <Section2 />
            </div>
            {/* Slide 3 */}
            <div className='min-w-full h-full'>
              <Section3 />
            </div>
          </div>
        </div>
      </div>
      

      <Outlet/>
    </div>
  )
}

export default ExamDash;