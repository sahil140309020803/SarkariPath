import React, { useContext, useState, useEffect } from 'react'
import { Outlet, useNavigate, useParams, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/Exam Dashboard/FeatureCard';
import { FaLayerGroup } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { FaBrain } from "react-icons/fa6";
import { History, ChevronRight, BookOpen, Layers, Info, ListChecks, XCircle } from 'lucide-react';
import AITopicSumm from '../components/Exam Dashboard/AITopicSumm';
import Section1 from '../components/Exam Dashboard/Section1';
import Section2 from '../components/Exam Dashboard/Section2';
import Section3 from '../components/Exam Dashboard/Section3';
import Difficulty from '../components/Exam Dashboard/Difficulty';
import CustomizeTopic from '../components/Exam Dashboard/CustomizeTopic';
import TestGenerating from '../components/Exam Dashboard/TestGenerating';
import ExamReadinessCard from '../components/Exam Dashboard/ExamReadinessCard';
import AITopicSummarizerCard from '../components/Exam Dashboard/AITopicSummarizerCard';
import { useExam } from '../context/ExamContext';
import BeautifulLoadingScreen from '../components/BeautifulLoadingScreen';

const ExamDash = () => {
  const { exam_name } = useParams();

  const {
    setActiveExamPage,
    showDifficulty,
    showCustomTopic,
    showTestGenerate,
    AItopicSummarizer, setAItopicSummarizer,
    isExamDataFetched,
    isExamLoading,
    examFetchError
  } = useExam();

  const [activeSection, setActiveSection] = useState(0);
  const [showHistory, setShowHistory] = useState(true);

  const navigate = useNavigate();

  const removeSlug = (text) => {
    return text.replaceAll('-', ' ');
  }

  useEffect(() => {
    setActiveExamPage(exam_name);
    return () => {
      setActiveExamPage(null);
    };
  }, [exam_name]);

  if (isExamLoading || (!isExamDataFetched && !examFetchError)) {
    return <BeautifulLoadingScreen message={`Loading ${removeSlug(exam_name)} Exam Details...`} />;
  }

  if (examFetchError === "Exam not found") {
    return <Navigate to="/404" replace />;
  }

  if (examFetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-100 dark:border-rose-900/30 max-w-md my-6">
          <XCircle className="w-12 h-12 text-red-500 dark:text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Exam Details</h3>
          <p className="text-slate-650 dark:text-slate-400 mb-6 text-sm">{examFetchError}</p>
          <button
            onClick={() => {
              setActiveExamPage(null); // trigger reset
              setTimeout(() => setActiveExamPage(exam_name), 50);
            }}
            className="w-full bg-blue-600 dark:bg-indigo-650 text-white py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-500 transition shadow-md font-bold cursor-pointer text-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const historyData = isExamDataFetched?.testHistory || [];

  // Calculate dynamic readiness percentage
  const TopicsMap = isExamDataFetched?.Topics || {};
  let totalTopicsCount = 0;
  for (const subject in TopicsMap) {
    totalTopicsCount += TopicsMap[subject].length;
  }
  const completedTopicsCount = isExamDataFetched?.syllabusProgress?.length || 0;
  const readinessPercentage = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  const features = [
    {
      icon: <FaBrain />,
      title: 'AI Topic Summarizer',
      desc: 'Get key insights on any topic instantly.'
    }
  ];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  return (
    <div className='w-full min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors pb-16'>
      <Navbar />

      {/* Premium Hero Section */}
      <div className='relative w-full bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 pt-24 pb-32 sm:pb-40 px-6 text-center overflow-hidden border-b border-indigo-900/50'>
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-fuchsia-600/15 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

        <div className='relative z-10 animate-fadeInUp'>
          <div className='font-extrabold text-4xl sm:text-5xl md:text-6xl text-white mb-4 tracking-tight drop-shadow-lg capitalize'>
            {removeSlug(exam_name)} Exam
          </div>
          <p className='text-base sm:text-lg md:text-xl text-indigo-200/90 font-medium max-w-2xl mx-auto drop-shadow'>
            Your path to success starts here. Target your weaknesses and build momentum.
          </p>
        </div>
      </div>

      {/* Floating Feature Cards */}
      <div className='-mt-20 relative z-20 max-w-5xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 place-items-stretch'>
        <AITopicSummarizerCard onClick={() => setAItopicSummarizer(true)} />
        <ExamReadinessCard
          completedTopicsCount={completedTopicsCount}
          totalTopicsCount={totalTopicsCount}
          onViewDetailedProgress={() => {
            setActiveSection(2);
            document.getElementById('navigation-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      </div>

      {/* Overlays */}
      {AItopicSummarizer && <AITopicSumm examContext={exam_name} />}
      {showDifficulty && <Difficulty />}
      {showCustomTopic && <CustomizeTopic />}
      {showTestGenerate && <TestGenerating />}

      {/* Main Content Layout */}
      <div className='max-w-6xl mx-auto w-full px-3 sm:px-6 mt-16 flex flex-col gap-10'>

        {/* Modern Segmented Navigation Tabs */}
        <div id="navigation-tabs" className="relative bg-white dark:bg-slate-800/80 backdrop-blur border border-gray-200 dark:border-slate-700 p-1.5 rounded-2xl flex flex-row shadow-sm transition-colors w-full max-w-3xl min-w-[20em] mx-auto">

          {/* Sliding Indicator */}
          <div
            className="absolute top-1.5 bottom-1.5 left-1.5 rounded-xl bg-indigo-600 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-md z-0"
            style={{
              width: 'calc((100% - 12px) / 3)',
              transform: `translateX(${activeSection * 100}%)`
            }}
          ></div>

          {[
            { id: 0, label: "Mock Test", icon: <BookOpen className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" /> },
            { id: 1, label: "Subject Wise Mock", icon: <Layers className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" /> },
            { id: 2, label: "Syllabus Tracker", icon: <ListChecks className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-4 rounded-xl text-[9px] xs:text-[11px] sm:text-sm md:text-base font-bold transition-colors duration-300 ${activeSection === tab.id
                ? 'text-white bg-transparent shadow-none'
                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
            >
              {tab.icon} <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Section Rendering with Fade-in */}
        <div className="w-full bg-transparent overflow-hidden">
          {activeSection === 0 && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <Section1 />
            </div>
          )}
          {activeSection === 1 && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <Section2 />
            </div>
          )}
          {activeSection === 2 && (
            <div className="animate-in fade-in zoom-in-95 duration-300 bg-transparent sm:bg-white sm:dark:bg-slate-900 rounded-3xl p-0 sm:p-8 border border-none sm:border-gray-200 sm:dark:border-slate-800 shadow-none sm:shadow-sm transition-colors">
              <Section3 />
            </div>
          )}
        </div>

        {/* History Table Module */}
        {showHistory && (
          <div id="history-module" className="animate-in fade-in duration-500 w-full bg-white dark:bg-slate-900 rounded-3xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors mt-4">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-indigo-500 dark:text-indigo-400 transition-colors">
                  <History size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Recent Test History</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors mt-0.5">Track your performance over time</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[450px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-md shadow-sm">
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider transition-colors">
                    <th className="px-6 py-5 font-semibold pl-8">Test Matrix</th>
                    <th className="px-6 py-5 font-semibold w-1/8">Attempted On</th>
                    <th className="px-6 py-5 font-semibold">Raw Score</th>
                    <th className="px-6 py-5 font-semibold w-1/5">Percentage</th>
                    <th className="px-6 py-5 font-semibold">Status</th>
                    <th className="px-6 py-5 font-semibold text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {historyData.map((row) => (
                    <tr key={row.submissionId} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-5 pl-8">
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200 transition-colors">{row.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors mt-0.5">#{row.submissionId}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">{formatTime(row.attemptedAt)}</td>
                      <td className="px-6 py-5">
                        <div className="text-base font-bold text-slate-800 dark:text-slate-200 transition-colors">{row.score} <span className='text-sm text-slate-400 font-normal'>/ {row.maxPossibleScore}</span></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2 w-full max-w-[140px]">
                          <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">
                            <span>{(row.score / row.maxPossibleScore * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                            <div
                              className={`h-full rounded-full ${(row.score / row.maxPossibleScore * 100) > 80 ? 'bg-emerald-500' : (row.score / row.maxPossibleScore * 100) > 50 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                              style={{ width: (row.score / row.maxPossibleScore * 100).toFixed(2) + '%' }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors
                                  ${row.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                          {row.status === 'Completed' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>}
                          {row.status === 'Paused' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right pr-8">
                        <button onClick={() => navigate(`/analysis/${row.submissionId}`)} className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-1 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                          Analysis <ChevronRight size={16} strokeWidth={3} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 p-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors uppercase tracking-widest">
              Showing recent {historyData.length} attempts
            </div>
          </div>
        )}

      </div>
      <Outlet />
    </div>
  )
}

export default ExamDash;