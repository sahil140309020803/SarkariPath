import React, { useEffect, useState } from 'react'
import { Bars, CirclesWithBar, ThreeDots } from 'react-loader-spinner';
import { useExam } from '../../context/ExamContext';
import io from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    const navigate = useNavigate();

    const { exam_cat, exam_name } = useParams();
    

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
    // console.log('Active Subject:', activeSubject);
    const title = `Quiz: ${activeSubject} - ${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}`;

    useEffect(() => {
        if (!backend_url) return;

        const newSocket = io(backend_url);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setAiText('Connected to AI Engine');
            
            const subjectName = activeSubject?.name || activeSubject || activeTopic || "General Awareness";
            console.log('Selected Exam:', activeExamPage);
            const payload = {
                title: title,
                examId: examId, 
                type: 'quiz',
                rules: [{ name: subjectName, count: 5 }],
                difficulty: difficulty || 'Medium',
                negativeMarks: 0, 
                duration: 20, 
                totalMarks: 15
            };

            newSocket.emit('start_generation', payload);
        });

        newSocket.on('generation_progress', (data) => {
            setQuestionCount(data.count);
            const textIndex = Math.min(Math.floor((data.count / 15) * aiTextList.length), aiTextList.length - 1);
            setAiText(aiTextList[textIndex] || 'Generating Questions');
        });

        newSocket.on('generation_complete', (data) => {
            setQuestionCount(15);
            setAiText('Finalizing Test...');
            setTimeout(() => {
                setShowTestGenerate(false);
                // console.log('Generated Test Data:', data);
                if(data.test && data.test._id) {
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
            bg100: 'bg-green-50',
            bg200: 'bg-green-100',
            bg300: 'bg-green-200',
            text700: 'text-green-600',
            text900: 'text-green-800',
            shadow: 'shadow-green-200',
            spinnerColor: '#4ade80',
        },
        Medium: {
            bg100: 'bg-yellow-50',
            bg200: 'bg-yellow-100',
            bg300: 'bg-yellow-200',
            text700: 'text-yellow-600',
            text900: 'text-yellow-800',
            shadow: 'shadow-yellow-200',
            spinnerColor: '#facc15',
        },
        Hard: {
            bg100: 'bg-rose-50',
            bg200: 'bg-rose-100',
            bg300: 'bg-rose-200',
            text700: 'text-rose-600',
            text900: 'text-rose-800',
            shadow: 'shadow-rose-200',
            spinnerColor: '#fb7185',
        }
    };

    const styles = difficultyStyles[difficulty] || difficultyStyles.Medium;

    return (
        <div>
            <div onClick={() => handleCancel()} className='fixed top-0 left-0 right-0 bottom-0 z-2 bg-black opacity-50'></div>
            <div className={`fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-3 flex flex-col items-center gap-5 p-2 rounded-xl w-[30rem] ${styles.bg100} transition-all duration-1000`}>
                <div className='animate-spin mt-4'>
                    <div className={`absolute p-4 m-2 size-16 rotate-45 ${styles.bg300} blur-sm`}></div>
                    <div className={`p-4 m-2 size-15 flex justify-center items-center z-1 relative ${styles.bg200} ${styles.text700} rounded-xl font-semibold text-lg`}>AI</div>
                </div>
                <div className='flex flex-col justify-center items-center gap-2'>
                    <div className={`${styles.bg200} ${styles.text700} font-bold p-0.5 shadow-xl pl-5 pr-5 rounded-2xl`}>{(difficulty || 'MEDIUM').toUpperCase()}</div>
                    <div className={`font-bold text-2xl ${styles.text700} flex justify-end items-end gap-3`}>
                        <div>Generating Your Quiz</div>
                        <ThreeDots visible={true} height={30} width={30} color={styles.spinnerColor} />
                    </div>
                </div>
                <div className='flex items-center gap-10'>
                    <div className={`shadow-2xl border font-semibold rounded-xl p-2 flex flex-col justify-center items-center h-[8rem] w-[7rem] ${styles.text700} ${styles.bg100}`}>
                        <div className='text-xl font-bold'>{questionCount} / 15</div>
                        <div className='text-[17px]'>Questions</div>
                    </div>
                    <Bars height="30" width="30" color={styles.spinnerColor} ariaLabel="bars-loading" visible={true} />
                    <div className={`shadow-2xl border font-semibold rounded-xl p-2 flex flex-col justify-center gap-1 items-center h-[8rem] w-[7rem] ${styles.text700} ${styles.bg100}`}>
                        <div>
                            <CirclesWithBar height="25" width="25" color={styles.spinnerColor} outerCircleColor={styles.spinnerColor} innerCircleColor={styles.spinnerColor} barColor={styles.spinnerColor} ariaLabel="circles-with-bar-loading" visible={true} />
                        </div>
                        <div className='flex flex-col justify-center items-center'>
                            <div className='text-[17px]'>AI Engine</div>
                            <div className='animate-pulse text-[13px]'>Processing...</div>
                        </div>
                    </div>
                </div>
                <div className={`animate-pulse relative transition-all duration-300 p-3 text-center pl-6 pr-6 ${styles.text700} font-semibold text-lg h-[4rem]`}>{aiText}...</div>
                <div className='w-full'>
                    <div className={`border-b p-2 text-lg font-semibold ${styles.text900} mb-5`}>💡 Quiz Tips</div>
                    <div className={`p-2 animate-bnce pl-4 pr-2 rounded-[8px] m-4 shadow-lg ${styles.bg200} ${styles.shadow} font-medium ${styles.text900} h-[4rem] flex justify-center items-center`}>
                        {tipText}
                    </div>
                </div>
                <div onClick={() => handleCancel()} className={`shadow-2xl ${styles.text900} font-semibold text-lg cursor-pointer p-2 pl-5 pr-5 rounded-xl ${styles.bg300} hover:opacity-80`}>Cancel</div>
            </div>
        </div>
    )
}

export default TestGenerating;