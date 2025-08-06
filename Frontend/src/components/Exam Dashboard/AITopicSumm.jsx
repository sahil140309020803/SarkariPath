import React, { useContext, useEffect, useState } from 'react'
import { AppContent } from '../../context/AppContext';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { RiLoader5Line } from "react-icons/ri";

const AITopicSumm = ({ examContext }) => {
    const { AItopicSummarizer,setAItopicSummarizer, backend_url } = useContext(AppContent);
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
    <div>
        {/* Wrapper */}
        <div onClick={() => setAItopicSummarizer(prev => !prev)} className='fixed top-0 left-0 right-0 bottom-0 z-2 bg-black opacity-50'></div>
        {/* Actual AI Topic Summarizer component */}
        <div className='fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-3 flex flex-col bg-white w-[60vw] rounded-xl max-h-[90dvh]'>
            {/* Heading */}
            <div className='flex justify-between items-center p-4 border-b border-gray-300'>
                <div className='font-medium text-xl'>✨ AI Topic Summarizer</div>
                <RxCross2 className='text-gray-500 cursor-pointer hover:text-black size-5' onClick={() => setAItopicSummarizer(prev => !prev)}/>
            </div>
            <div className='flex flex-col gap-5 pl-7 pr-7 border-b pb-8 pt-8 border-gray-300'>
                {/* Label & Input */}
                <div className='flex flex-col gap-2'>
                    <div className='text-gray-800'>Enter any topic from the syllabus to get a concise summary.</div>
                    <input type="text" placeholder='Ex: Simplification' className='p-2 pl-3 border border-gray-500 text-[17px] rounded-[8px] outline-none' value={topic} onChange={(e) => setTopic(e.target.value)} required/>
                </div>
                {/* Language & Generate Summary */}
                <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-5'>
                        <span className='text-gray-800'>Select Language:</span>
                        <span className='flex items-center gap-1 cursor-pointer'>
                            <input type="radio" id='lan-eng' name='language' value='english' checked={language === 'english'} onChange={handleChange}/>
                            <label htmlFor='lan-eng' className='cursor-pointer'>English</label>
                        </span>
                        <span className='flex items-center gap-1'>
                            <input type="radio" id='lan-hindi' name="language" value="hindi" checked={language === 'hindi'} onChange={handleChange}/>
                            <label htmlFor='lan-hindi' className='cursor-pointer'>Hindi</label>
                        </span>
                    </div>
                    <button onClick={() => GenerateContent()} className={`w-full text-center border rounded-[8px] cursor-pointer p-2 bg-radial-[at_50%_75%] from-sky-800 via-blue-600 to-indigo-700 to-90% text-lg font-medium text-white hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl flex gap-6 justify-center items-center`} disabled={loading}>
                        <span>{loading ? 'Generating' : 'Generate'} Summary</span>
                        {loading && <RiLoader5Line className='animate-spin size-6'/>}
                    </button>
                </div>
            </div>
            {/* Generated Result */}
            <div className='p-5 overflow-auto overflow-x-hidden' dangerouslySetInnerHTML={{ __html: content }}>
            </div>
        </div>
    </div>
  )
}

export default AITopicSumm;