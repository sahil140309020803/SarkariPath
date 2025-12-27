import React, { useContext, useState, useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/Exam Dashboard/FeatureCard';
import { FaLayerGroup } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { FaBrain } from "react-icons/fa6";
import { History, ChevronRight } from 'lucide-react'; // Imported for the new table
import AITopicSumm from '../components/Exam Dashboard/AITopicSumm';
import Section1 from '../components/Exam Dashboard/Section1';
import Section2 from '../components/Exam Dashboard/Section2';
import Section3 from '../components/Exam Dashboard/Section3';
import Difficulty from '../components/Exam Dashboard/Difficulty';
import CustomizeTopic from '../components/Exam Dashboard/CustomizeTopic';
import TestGenerating from '../components/Exam Dashboard/TestGenerating';
import { useExam } from '../context/ExamContext';

const ExamDash = () => {
  const { exam_cat, exam_name } = useParams();
  
  const {
    setActiveExamPage,
    showDifficulty, 
    showCustomTopic,
    showTestGenerate,
    AItopicSummarizer, setAItopicSummarizer,
    isExamDataFetched
  } = useExam();

  const [activeSection, setActiveSection] = useState(0);
  const [showHistory, setShowHistory] = useState(true); // New state for history toggle

  const navigate = useNavigate();

  const removeSlug = (text) => {
    return text.replaceAll('-', ' ');
  }

  useEffect(() => {
    setActiveExamPage(exam_name);
  }, []);

  const historyData = isExamDataFetched?.testHistory || [];
  console.log(historyData);


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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  return (
    <div className='w-full h-full flex flex-col items-center justify-center gap-10 pb-5'>
      <Navbar />
      
      {/* Exam Heading and Features Card */}
      <div className='flex flex-col gap-12'>
        {/* Exam name Heading */}
        <div className='flex flex-col justify-center items-center gap-1'>
          <div className='font-bold text-4xl bg-radial-[at_50%_75%] from-sky-700 via-blue-600 to-indigo-800 to-90% bg-clip-text text-transparent capitalize'>
            {removeSlug(exam_name)} Exam
          </div>
          <div className='text-gray-500'>Your path to success starts here.</div>
        </div>
        
        {/* AI Features Cards */}
        <div className='flex justify-center items-center gap-8 flex-wrap'>
          <FeatureCard 
            icon={features[0].icon} 
            title={features[0].title} 
            desc={features[0].desc} 
            onClick={() => setAItopicSummarizer(true)} 
          />
          {/* Linked onClick to toggle History */}
          <FeatureCard 
            icon={features[1].icon} 
            title={features[1].title} 
            desc={features[1].desc} 
          />
          <FeatureCard 
            icon={features[2].icon} 
            title={features[2].title} 
            desc={features[2].desc} 
            onClick={() => setShowHistory(prev => !prev)}
          />
        </div>
      </div>

      {/* Conditionally Rendered Components */}
      {AItopicSummarizer && <AITopicSumm examContext={exam_name} />}
      {showDifficulty && <Difficulty />}
      {showCustomTopic && <CustomizeTopic />}
      {showTestGenerate && <TestGenerating />}

      {/* Sections Container */}
      <div className='max-w-[85rem] flex flex-col gap-8 max-h-full m-2 overflow-hidden'>
        {/* Section Tabs */}
        <div className='border-b border-gray-400 flex justify-around items-center font-medium text-[18px] text-gray-600 gap-5'>
          <div onClick={() => setActiveSection(0)} className={`text-center p-5 grow border-b-2 cursor-pointer transition-colors ${activeSection === 0 ? 'text-blue-600 border-b-blue-600' : 'border-b-transparent hover:border-black hover:text-black'}`}>Mock Test</div>
          <div onClick={() => setActiveSection(1)} className={`text-center p-5 grow border-b-2 cursor-pointer transition-colors ${activeSection === 1 ? 'text-blue-600 border-b-blue-600' : 'border-b-transparent hover:border-black hover:text-black'}`}>Subject Wise Mock Test</div>
          <div onClick={() => setActiveSection(2)} className={`text-center p-5 grow border-b-2 cursor-pointer transition-colors ${activeSection === 2 ? 'text-blue-600 border-b-blue-600' : 'border-b-transparent hover:border-black hover:text-black'}`}>About</div>
        </div>

        {/* Slider Viewport*/}
        <div className='w-full h-full'>
          {/* Slider Track: This element moves */}
          <div 
            className={`flex w-full h-full transition-transform duration-500 ease-in-out`}
            style={{ transform: `translateX(-${activeSection * 100}%)` }}
          >
            {/* Slide 1 */}
            <div className='min-w-full max-h-[45rem] overflow-y-auto flex justify-center items-center'>
              <Section1 />
            </div>
            {/* Slide 2 */}
            <div className='min-w-full max-h-[45rem] overflow-y-auto flex justify-center items-center'>
              <Section2 />
            </div>
            {/* Slide 3 */}
            <div className='min-w-full h-[0rem] overflow-hidden'>
              <Section3 />
            </div>
          </div>
        </div>
      </div>


      {/* --- INTEGRATED RECENT HISTORY TABLE START --- */}
      {showHistory && (
        <div className="w-[85rem] animate-fadeIn bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-4">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-500">
                <History size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Test History</h2>
                <p className="text-xs text-slate-500">Track your performance over time</p>
              </div>
            </div>
            <button className="text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
              View Full Report
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4 font-semibold pl-8">Test Name</th>
                  <th className="px-6 py-4 font-semibold w-1/8">Date Attempted</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold w-1/5 ">Score Percentage</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right pr-8 ">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historyData.map((row) => (
                  <tr key={row.submissionId} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 pl-8">
                      <div className="text-sm font-semibold text-slate-800">{row.title}</div>
                      <div className="text-xs text-slate-400 font-medium">ID: #{row.submissionId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{formatTime(row.attemptedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{row.score} / {row.maxPossibleScore}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Marks</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>{(row.score / row.maxPossibleScore * 100).toFixed(2)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${(row.score / row.maxPossibleScore * 100).toFixed(2) > 80 ? 'bg-emerald-500' : (row.score / row.maxPossibleScore * 100).toFixed(2) > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: (row.score / row.maxPossibleScore * 100).toFixed(2) + '%' }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${row.statusColor}`}>
                        {row.status === 'Completed' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>}
                        {row.status === 'Paused' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-8">
                      <button onClick={() => navigate(`/analysis/${row.submissionId}`)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-1">
                        Analysis <ChevronRight size={14} strokeWidth={3} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-3 text-center text-xs text-slate-400">
             Showing recent {historyData.length} attempts
          </div>
        </div>
      )}
      {/* --- INTEGRATED RECENT HISTORY TABLE END --- */}
      
      <Outlet/>
    </div>
  )
}

export default ExamDash;