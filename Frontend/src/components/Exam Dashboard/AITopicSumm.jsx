import React, { useContext, useEffect, useState } from 'react'
// import { AppContent } from '../../context/AppContext';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { RiLoader5Line } from "react-icons/ri";
import { useExam } from '../../context/ExamContext';
import { useUser } from '../../context/UserContext';

const AITopicSumm = ({ examContext }) => {
    // const { AItopicSummarizer,setAItopicSummarizer, backend_url } = useContext(AppContent);

    const {
    AItopicSummarizer, setAItopicSummarizer
} = useExam();

    const { backend_url } = useUser();

    const [language, setLanguage] = useState('english');
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setLanguage(e.target.value);
    }

    useEffect(() => {
        if(!AItopicSummarizer)
            setContent('');
    
    }, [AItopicSummarizer, setAItopicSummarizer]);
    

    const GenerateContent = async() => {
        console.log('Button clicked')
        if(!topic || !language || !examContext) {
            alert('Please fill all the fields');
        }
        setLoading(true);
        try {
            const {data} = await axios.post(`${backend_url}/api/summarize`, {topic, language, examContext});
            if(data.success) {
                setContent(data.message);
            }
        }catch(err) {
            console.log(err);
        } 
        setLoading(false);
    }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0'>
        {/* Backdrop Wrapper */}
        <div onClick={() => setAItopicSummarizer(prev => !prev)} className='absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity'></div>
        
        {/* Actual AI Topic Summarizer Modal */}
        <div className='relative z-[110] flex flex-col bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl max-h-[90dvh] shadow-2xl border border-slate-200 dark:border-slate-700 transition-colors overflow-hidden'>
            
            {/* Header */}
            <div className='flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 transition-colors'>
                <div className='font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2'>
                    <span className="text-xl">✨</span> AI Topic Summarizer
                </div>
                <button onClick={() => setAItopicSummarizer(prev => !prev)} className='p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'>
                    <RxCross2 className='size-5'/>
                </button>
            </div>
            
            {/* Content Body */}
            <div className='flex flex-col gap-6 p-6 border-b border-slate-200 dark:border-slate-800 transition-colors'>
                
                {/* Topic Input */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors'>Enter any topic from the syllabus to get a concise summary.</label>
                    <input type="text" placeholder='e.g., Simplification, Gravitation, Economics...' className='p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all' value={topic} onChange={(e) => setTopic(e.target.value)} required/>
                </div>
                {/* Language & Generate Actions */}
                <div className='flex flex-col gap-5'>
                    <div className='flex items-center gap-6 text-sm font-medium'>
                        <span className='text-slate-600 dark:text-slate-400'>Response Language:</span>
                        <label className='flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200'>
                            <input type="radio" name='language' value='english' checked={language === 'english'} onChange={handleChange} className='w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800'/>
                            English
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200'>
                            <input type="radio" name="language" value="hindi" checked={language === 'hindi'} onChange={handleChange} className='w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800'/>
                            Hindi
                        </label>
                    </div>
                    <button onClick={() => GenerateContent()} className={`w-full text-center rounded-xl cursor-pointer p-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-base font-semibold text-white hover:from-indigo-500 hover:to-blue-400 transition-all duration-300 shadow-md flex gap-3 justify-center items-center ${loading ? 'opacity-70 pointer-events-none' : ''}`} disabled={loading}>
                        <span>{loading ? 'Generating...' : 'Generate AI Summary'}</span>
                        {loading && <RiLoader5Line className='animate-spin size-5'/>}
                    </button>
                </div>
            </div>
            {/* Generated Result Container */}
            <div className='p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-300 text-sm md:text-base prose dark:prose-invert max-w-none' dangerouslySetInnerHTML={{ __html: content || '<p class="text-slate-400 dark:text-slate-500 italic">Your generated summary will appear here...</p>' }}>
            </div>
        </div>
    </div>
  )
}

export default AITopicSumm;