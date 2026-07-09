import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, BookOpen, Calculator, BrainCircuit, Globe, Beaker, FileText, PenTool } from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import axios from 'axios';

const getSubjectIcon = (subjectName) => {
    const name = subjectName.toLowerCase();
    if (name.includes('math') || name.includes('quantitative') || name.includes('aptitude')) return <Calculator className="text-emerald-500" size={24} />;
    if (name.includes('reasoning') || name.includes('intelligence')) return <BrainCircuit className="text-indigo-500" size={24} />;
    if (name.includes('general') || name.includes('awareness') || name.includes('knowledge') || name.includes('gk')) return <Globe className="text-amber-500" size={24} />;
    if (name.includes('science') || name.includes('physics') || name.includes('chemistry')) return <Beaker className="text-cyan-500" size={24} />;
    if (name.includes('english') || name.includes('language') || name.includes('hindi')) return <FileText className="text-rose-500" size={24} />;
    return <BookOpen className="text-violet-500" size={24} />;
}

const Section3 = () => {
  const { isExamDataFetched, setIsExamDataFetched, backend_url } = useExam();
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [isUpdating, setIsUpdating] = useState({});

  const Subjects = isExamDataFetched?.Subjects || [];
  const TopicsMap = isExamDataFetched?.Topics || {};
  const initialProgress = isExamDataFetched?.syllabusProgress || [];
  const examId = isExamDataFetched?.ExamId;

  useEffect(() => {
    // Initialize completed topics
    if (initialProgress && initialProgress.length > 0) {
        setCompletedTopics(new Set(initialProgress));
    }
  }, [initialProgress]);

  const toggleTopic = async (topicName) => {
    if(!examId) return;

    // Optimistic UI update
    setCompletedTopics(prev => {
        const newSet = new Set(prev);
        if(newSet.has(topicName)) {
            newSet.delete(topicName);
        } else {
            newSet.add(topicName);
        }
        return newSet;
    });

    setIsUpdating(prev => ({...prev, [topicName]: true}));

    try {
        const { data } = await axios.post(`${backend_url}/api/syllabus/update`, {
            examId: examId,
            topicName: topicName
        }, { withCredentials: true });

        if (data.success) {
            // Ensure sync with server
            setCompletedTopics(new Set(data.completedTopics));
            // Sync with global context so the dashboard card updates dynamically
            if (setIsExamDataFetched) {
                setIsExamDataFetched(prev => ({
                    ...prev,
                    syllabusProgress: data.completedTopics
                }));
            }
        }
    } catch (err) {
        console.error("Failed to update progress:", err);
        // On error, we could revert optimistic update, but skipping for simplicity
    } finally {
        setIsUpdating(prev => ({...prev, [topicName]: false}));
    }
  };

  return (
    <div className='w-full flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='font-bold text-2xl text-slate-800 dark:text-slate-100 transition-colors'>Syllabus Tracker</h2>
        <p className='text-slate-500 dark:text-slate-400 text-sm'>Track your preparation progress across key exam subjects.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {Subjects.length === 0 && <div className="text-slate-500 col-span-full text-center py-10">No subjects found for this exam.</div>}
        
        {Subjects.map((subject, idx) => {
            const subjectTopics = TopicsMap[subject] || [];
            const total = subjectTopics.length;
            const completed = subjectTopics.filter(t => completedTopics.has(t)).length;
            const dynamicProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
          <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 transition-colors shadow-sm">
            <div className='flex items-center gap-4 mb-5'>
              <div className='p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700'>
                {getSubjectIcon(subject)}
              </div>
              <div className='flex-1'>
                <h3 className='font-bold text-slate-800 dark:text-slate-200'>{subject}</h3>
                <div className='text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex justify-between'>
                  <span>Overall Progress</span>
                  <span className='text-indigo-600 dark:text-indigo-400'>{dynamicProgress}%</span>
                </div>
                <div className='w-full h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full mt-2 overflow-hidden'>
                  <div className='h-full bg-indigo-500 rounded-full transition-all duration-500' style={{ width: `${dynamicProgress}%` }}></div>
                </div>
              </div>
            </div>

            <div className='space-y-3 mt-6 border-t border-slate-200 dark:border-slate-700/50 pt-5 max-h-64 overflow-y-auto custom-scrollbar pr-2'>
              {total === 0 && <div className="text-xs text-slate-400 italic">No topics mapped.</div>}
              {subjectTopics.map((topic, tIdx) => {
                const isCompleted = completedTopics.has(topic);
                return (
                <div 
                  key={tIdx} 
                  onClick={() => !isUpdating[topic] && toggleTopic(topic)}
                  className={`flex items-start gap-3 group transition-all duration-200 ${isUpdating[topic] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/30 p-1.5 -ml-1.5 rounded-lg'}`}
                >
                  <div className='mt-0.5 text-slate-400 group-hover:text-indigo-500 transition-colors'>
                    {isCompleted
                      ? <CheckCircle className='text-emerald-500 drop-shadow-sm' size={18} /> 
                      : <Circle size={18} />
                    }
                  </div>
                  <span className={`text-sm font-medium transition-all duration-300 ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                    {topic}
                  </span>
                </div>
              )})}
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

export default Section3;