import React, { useEffect, useState } from 'react'
import { Bars, CirclesWithBar, ThreeDots } from 'react-loader-spinner';
import { Sparkles } from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import io from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';


const TestGenerating = () => {
    const {
        activeSubject,
        activeExamPage,
        setActiveExamPage,
        setActiveSubject,
        activeTopic,
        setActiveTopic,
        difficulty,
        setDifficulty,
        setShowTestGenerate,
        backend_url,
        isExamDataFetched,
    } = useExam();

    const [tipText, setTipText] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [selectedExam, setSelectedExam] = useState('');
    const [socket, setSocket] = useState(null);
    const [aiText, setAiText] = useState('Initializing Connection');
    const [waitingStatus, setWaitingStatus] = useState({
        isWaiting: false,
        position: 0,
        estimatedSeconds: 0
    });
    const navigate = useNavigate();


    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleCancel = () => {
        if (socket) socket.disconnect();
        setShowTestGenerate(false);
        setDifficulty(null);
        setActiveSubject(null);
        setActiveTopic(null);
    }

    const aiTextList = ['Thinking', 'Analyzing your preferences', 'Accessing Knowledge Base', 'Crafting unique questions', 'Almost there', 'Running final checks', 'Adding final touches'];
    const tipsList = ['Keep a pen and notebook ready for any rough work or calculations.', 'Have a glass of water nearby', 'Make sure your lighting is good and you are seated comfortably.', 'If a question seems too difficult, mark it for review and move on.', 'Read each question and all its options carefully.', 'Take a deep breath. A calm mind performs best.', 'This is a practice test. Learn from your mistakes.'];

    useEffect(() => {
        const iterateTipList = async () => {
            while (true) {
                const randomIndex = Math.floor(Math.random() * tipsList.length);
                setTipText(tipsList[randomIndex]);
                await delay(5000);
            }
        }
        iterateTipList();
    }, []);

    const examId = isExamDataFetched?.ExamId || null;
    const testTitle = activeTopic
        ? `Quiz: ${activeTopic} (${activeSubject})`
        : `Quiz: ${activeSubject || "General Awareness"}`;

    const fullTitle = `${testTitle} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    useEffect(() => {
        if (!backend_url) return;

        const newSocket = io(backend_url);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setAiText('Connected to AI Engine');

            // Prioritize activeTopic over activeSubject for specific topic tests
            const ruleName = activeTopic || activeSubject?.name || activeSubject || "General Awareness";

            console.log('Selected Exam:', activeExamPage);
            const payload = {
                title: fullTitle,
                examId: examId,
                type: 'quiz',
                rules: [{ name: ruleName, count: 15 }],
                difficulty: difficulty || 'Medium',
                negativeMarks: 0,
                duration: 15,
                totalMarks: 15,
                subjectName: activeSubject?.name || activeSubject || null,
                topicName: activeTopic || null,
                examName: isExamDataFetched?.ExamName || null,
                socketId: newSocket.id
            };

            axios.post(`${backend_url}/api/quiz/generate`, payload, { withCredentials: true }).catch(err => {
                console.error("Scheduler POST failed:", err);
                setAiText('Failed to queue quiz generation');
                toast.error(`Queue error: ${err.message}`);
            });
        });

        newSocket.on('generation_progress', (data) => {
            if (data.status === 'waiting') {
                setWaitingStatus({
                    isWaiting: true,
                    position: data.queuePosition,
                    estimatedSeconds: data.estimatedWaitSeconds
                });
                setAiText(`Waiting in Queue (Position: ${data.queuePosition})`);
            } else if (data.status === 'generating') {
                setWaitingStatus(prev => ({ ...prev, isWaiting: false }));
                setQuestionCount(data.generatedQuestions);
                const textIndex = Math.min(Math.floor((data.generatedQuestions / 15) * aiTextList.length), aiTextList.length - 1);
                setAiText(aiTextList[textIndex] || `Generating Questions (${data.generatedQuestions}/15)`);
            } else {
                setQuestionCount(data.count);
                const textIndex = Math.min(Math.floor((data.count / 15) * aiTextList.length), aiTextList.length - 1);
                setAiText(aiTextList[textIndex] || 'Generating Questions');
            }
        });

        newSocket.on('generation_complete', (data) => {
            setQuestionCount(15);
            setAiText('Finalizing Test...');
            setTimeout(() => {
                setShowTestGenerate(false);
                // console.log('Generated Test Data:', data);
                if (data.test && data.test._id) {
                    const testId = data.test._id;
                    console.log('Navigating to Test ID:', testId);
                    navigate(`/tests/${testId}`);
                } else {
                    toast.error("Test generated but ID missing.");
                }
            }, 1000);
        });

        newSocket.on('generation_error', (error) => {
            console.error(error);
            setAiText('Error Encountered');
            toast.error(`Generation Failed: ${error.message}`);
            setTimeout(() => handleCancel(), 3000);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [backend_url, activeSubject, activeTopic, difficulty, selectedExam]);

    const difficultyStyles = {
        Easy: {
            accent: 'emerald',
            color: '#10b981',
            glow: 'rgba(16, 185, 129, 0.2)'
        },
        Medium: {
            accent: 'indigo',
            color: '#6366f1',
            glow: 'rgba(99, 102, 241, 0.2)'
        },
        Hard: {
            accent: 'rose',
            color: '#f43f5e',
            glow: 'rgba(244, 63, 94, 0.2)'
        }
    };

    const style = difficultyStyles[difficulty] || difficultyStyles.Medium;

    if (waitingStatus.isWaiting) {
        return (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                {/* Non-clickable Backdrop */}
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>

                {/* Premium Waiting Card */}
                <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                    {/* Background Glows */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-${style.accent}-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2`}></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>

                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="relative mb-8">
                            <div className={`absolute inset-0 rounded-full border-2 border-${style.accent}-500/30 animate-pulse`}></div>
                            <div className={`size-20 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl flex items-center justify-center relative z-10`}>
                                <div className={`absolute inset-0 bg-${style.accent}-500/20 blur-xl rounded-full`}></div>
                                <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500`}>WAIT</span>
                            </div>
                        </div>

                        <div className={`px-4 py-1.5 rounded-full bg-${style.accent}-500/10 border border-${style.accent}-500/20 mb-4`}>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] text-${style.accent}-400`}>
                                Generating AI Quiz...
                            </span>
                        </div>

                        <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                            You are currently waiting
                        </h2>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
                            Gemini API limits are active. We are queuing requests to avoid failures.
                        </p>
                    </div>

                    {/* Queue Status Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                            <div className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tighter">
                                {waitingStatus.position}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Queue Position</div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="text-2xl sm:text-3xl font-black text-indigo-400 mb-1 tracking-tighter">
                                ~{waitingStatus.estimatedSeconds}s
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimated Wait</div>
                        </div>
                    </div>

                    {/* Loader Ring */}
                    <div className="mt-8 flex justify-center">
                        <ThreeDots visible={true} height={40} width={40} color={style.color} />
                    </div>

                    {/* Cancel Button */}
                    <div className="mt-8 flex justify-center relative z-10">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-700 hover:text-white transition-all uppercase tracking-widest"
                        >
                            Cancel & Leave Queue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Non-clickable Backdrop */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>

            {/* Premium Generation Card */}
            <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                {/* Background Glows */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${style.accent}-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2`}></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>

                {/* Header Section */}
                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative mb-8">
                        {/* Outer Glow Ring */}
                        <div className={`absolute inset-0 rounded-full border-2 border-${style.accent}-500/30 animate-ping`}></div>
                        {/* AI Core Visual */}
                        <div className={`size-20 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl flex items-center justify-center relative z-10 transform rotate-12`}>
                            <div className={`absolute inset-0 bg-${style.accent}-500/20 blur-xl rounded-full`}></div>
                            <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500`}>AI</span>
                        </div>
                    </div>

                    <div className={`px-4 py-1.5 rounded-full bg-${style.accent}-500/10 border border-${style.accent}-500/20 mb-4`}>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] text-${style.accent}-400`}>
                            {difficulty || 'MEDIUM'} DIFFICULTY
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                        Generating Your Test
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto flex items-center justify-center gap-2">
                        <ThreeDots visible={true} height={15} width={15} color={style.color} />
                        {aiText}
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-2 gap-4 mt-10 relative z-10">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center group transition-all">
                        <div className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tighter">
                            {questionCount} <span className="text-slate-500 text-base">/ 15</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Questions Generated</div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="relative z-10 mb-2">
                            <CirclesWithBar height="30" width="30" color={style.color} outerCircleColor={style.color} innerCircleColor={style.color} barColor={style.color} visible={true} />
                        </div>
                        <div className="relative z-10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Processing</div>
                    </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-8 relative z-10">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overall Progress</span>
                        <span className={`text-sm font-bold text-${style.accent}-400`}>{Math.round((questionCount / 15) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
                        <div
                            className={`h-full bg-gradient-to-r from-indigo-500 to-${style.accent}-500 transition-all duration-700 ease-out`}
                            style={{ width: `${(questionCount / 15) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-8 pt-8 border-t border-slate-800/50 relative z-10">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <div className={`p-1.5 rounded-lg bg-${style.accent}-500/10 text-${style.accent}-400`}>
                            <Sparkles size={14} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pro Tip</span>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-4 min-h-[80px] flex items-center justify-center text-center italic text-slate-300 text-sm leading-relaxed transition-all duration-500">
                        "{tipText}"
                    </div>
                </div>

                {/* Bottom Status */}
                <div className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] animate-pulse relative z-10">
                    Do not close this window
                </div>
            </div>
        </div>
    );
};

export default TestGenerating;