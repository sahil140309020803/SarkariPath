import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Eye, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import io from 'socket.io-client';
import { useExam } from '../../context/ExamContext';
import Modal from './Modal';
import { toast } from "react-toastify";
import axios from 'axios';

const USE_AI_SCHEDULER = true;

const TestGenerator = () => {
    const { examCatList, backend_url } = useExam();

    const [socket, setSocket] = useState(null);
    const [subjects, setSubjects] = useState([{ name: '', count: 1 }]);
    const [recentGenerations, setRecentGenerations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previewTest, setPreviewTest] = useState(null);
    const [previewLang, setPreviewLang] = useState('en');
    const [isValidating, setIsValidating] = useState(false);
    const [validatingBatchIndex, setValidatingBatchIndex] = useState(null);
    const [validationReport, setValidationReport] = useState([]);
    const [applyingCorrectionId, setApplyingCorrectionId] = useState(null);
    const [regeneratingQuestionId, setRegeneratingQuestionId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [availableExams, setAvailableExams] = useState([]);
    const [title, setTitle] = useState('');
    const [marksPerQuestion, setMarksPerQuestion] = useState('1');
    const [negativeMarks, setNegativeMarks] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [progress, setProgress] = useState({ count: 0, total: 0 });
    const [isAiLoadingCounts, setIsAiLoadingCounts] = useState(false);


    // Fetch all past generations on mount
    useEffect(() => {
        fetchGenerations();
    }, [progress]);

    const fetchGenerations = async () => {
        if (!backend_url) return;
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/admin/test-generations/fetch`);
            if (data.success && data.generations) {
                setRecentGenerations(data.generations);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert(error.message);
        }
    }
    console.log('recentGenerations', recentGenerations);

    const handleDeleteGeneration = async (testId) => {
        if (!confirm('Are you sure you want to discard this test generation? This action cannot be undone.')) {
            return;
        }
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/admin/test-generations/delete/${testId}`);
            if (data.success) {
                toast.success('Test generation discarded successfully', { autoClose: 2000 });
                setPreviewTest(null);
                fetchGenerations();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to discard test generation');
        }
    }

    const handlePublishGeneration = async (testId) => {
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/admin/test-generations/publish/${testId}`);
            if (data.success) {
                toast.success('Test generation published successfully', { autoClose: 2000 });
                fetchGenerations();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to publish test generation');
        }
    }





    useEffect(() => {
        if (!backend_url) return;
        const newSocket = io(backend_url);
        setSocket(newSocket);

        newSocket.on('generation_progress', (data) => {
            setProgress(data);
        });

        newSocket.on('generation_complete', (data) => {
            setIsLoading(false);
            setProgress({ count: 0, total: 0 });
            alert(data.message);

            const newTest = {
                title: data.test.Title,
                date: new Date(data.test.createdAt),
                content: data.test
            };
            setRecentGenerations(prev => [newTest, ...prev].slice(0, 5));
        });

        newSocket.on('generation_error', (error) => {
            setIsLoading(false);
            setProgress({ count: 0, total: 0 });
            alert(`Error: ${error.message}`);
        });

        return () => {
            newSocket.off('generation_progress');
            newSocket.off('generation_complete');
            newSocket.off('generation_error');
            newSocket.disconnect();
        };
    }, [backend_url]);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedExam('');
    };

    useEffect(() => {
        if (selectedCategory && examCatList) {
            const selectedCategoryData = examCatList.find(cat => cat._id === selectedCategory);
            setAvailableExams(selectedCategoryData?.Exams || []);
        } else {
            setAvailableExams([]);
        }
    }, [selectedCategory, examCatList]);

    const handleExamChange = (e) => {
        setSelectedExam(e.target.value);
        fetchSubjectsForExam(e.target.value);
    };

    const fetchSubjectsForExam = async (examId) => {
        if (!backend_url) return;
        setIsAiLoadingCounts(true);
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.post(`${backend_url}/api/admin/test-generations/subjects`, { examId });
            if (data.success && data.Subjects) {
                let initialSubjects = data.Subjects.map(sub => ({ name: sub, count: 1 }));
                setSubjects(initialSubjects.length > 0 ? initialSubjects : [{ name: '', count: 1 }]);

                // Now attempt to get AI recommendation for question counts
                if (data.Subjects.length > 0) {
                    try {
                        const curExam = availableExams.find(e => e._id === examId);
                        const examName = curExam ? curExam.Name : 'Competitive Exam';
                        const aiResp = await axios.post(`${backend_url}/api/exams/ai/generate-question-counts`, {
                            examName: examName,
                            subjects: data.Subjects
                        });

                        if (aiResp.data.success && aiResp.data.countsMap) {
                            initialSubjects = initialSubjects.map(sub => ({
                                name: sub.name,
                                count: aiResp.data.countsMap[sub.name] || 1
                            }));
                            setSubjects(initialSubjects);
                            toast.success("AI auto-populated question breakdown based on latest syllabus!", { autoClose: 2000 });
                        }
                    } catch (e) {
                        console.error("AI question count distribution failed", e);
                    }
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsAiLoadingCounts(false);
        }
    }


    const handleAddSubject = () => setSubjects([...subjects, { name: '', count: 1 }]);
    const handleRemoveSubject = (index) => setSubjects(subjects.filter((_, i) => i !== index));
    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    const totalQuestions = subjects.reduce((sum, s) => sum + (parseInt(s.count) || 0), 0);

    const handleGenerate = () => {
        if (!socket) {
            alert("Connection not yet established. Please try again in a moment.");
            return;
        }

        setIsLoading(true);
        setProgress({ count: 0, total: totalQuestions });

        const payload = {
            title,
            examId: selectedExam,
            rules: subjects.filter(s => s.name && s.count > 0),
            difficulty,
            marksPerQuestion: parseFloat(marksPerQuestion) || 1,
            negativeMarks: parseFloat(negativeMarks) || 0,
            duration: 60,
            totalMarks: totalQuestions * (parseFloat(marksPerQuestion) || 1)
        };

        if (USE_AI_SCHEDULER) {
            axios.post(`${backend_url}/api/admin/mock/generate`, {
                ...payload,
                socketId: socket.id
            }, { withCredentials: true }).catch(err => {
                console.error("Admin Generator POST failed:", err);
                setIsLoading(false);
                toast.error(`Admin generator error: ${err.message}`);
            });
        } else {
            socket.emit('start_generation', payload);
        }
    };

    const handleAIValidate = async () => {
        if (!previewTest || !backend_url) return;
        setIsValidating(true);
        setValidationReport([]);
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.post(`${backend_url}/api/admin/mock/validate`, {
                testId: previewTest._id
            });
            if (data.success) {
                setValidationReport(data.issues || []);
                if (data.issues && data.issues.length > 0) {
                    toast.warning(`AI found ${data.issues.length} question(s) with errors!`);
                } else {
                    toast.success("AI Validation Passed! 100% correct questions.");
                }
            } else {
                toast.error(data.message || "Failed to validate test.");
            }
        } catch (err) {
            console.error("AI Validation error:", err);
            toast.error(`Validation error: ${err.message}`);
        } finally {
            setIsValidating(false);
        }
    };

    const handleAIValidateBatch = async (batch) => {
        if (!previewTest || !backend_url) return;
        setValidatingBatchIndex(batch.index);
        axios.defaults.withCredentials = true;
        try {
            const questionIds = batch.questions.map(q => q._id);
            const { data } = await axios.post(`${backend_url}/api/admin/mock/validate`, {
                testId: previewTest._id,
                questionIds
            });
            if (data.success) {
                setValidationReport(prev => {
                    const cleaned = prev.filter(issue => !questionIds.includes(issue.questionId));
                    return [...cleaned, ...(data.issues || [])];
                });
                if (data.issues && data.issues.length > 0) {
                    toast.warning(`AI found ${data.issues.length} error(s) in Batch ${batch.index}!`);
                } else {
                    toast.success(`Batch ${batch.index} passed AI Validation successfully!`);
                }
            } else {
                toast.error(data.message || `Failed to validate Batch ${batch.index}.`);
            }
        } catch (err) {
            console.error("AI Batch Validation error:", err);
            toast.error(`Validation error: ${err.message}`);
        } finally {
            setValidatingBatchIndex(null);
        }
    };

    const handleApplyCorrection = async (questionId, correctedPayload) => {
        if (!previewTest || !backend_url) return;
        setApplyingCorrectionId(questionId);
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.post(`${backend_url}/api/admin/mock/apply-correction`, {
                testId: previewTest._id,
                questionId,
                correctedPayload
            });
            if (data.success && data.test) {
                setPreviewTest(data.test);
                setValidationReport(prev => prev.filter(issue => issue.questionId !== questionId));
                setRecentGenerations(prev => prev.map(gen => gen._id === data.test._id ? data.test : gen));
                toast.success("Correction applied successfully!");
            } else {
                toast.error(data.message || "Failed to apply correction.");
            }
        } catch (err) {
            console.error("Apply correction error:", err);
            toast.error(`Apply correction error: ${err.message}`);
        } finally {
            setApplyingCorrectionId(null);
        }
    };

    const handleRegenerateQuestion = async (questionId) => {
        if (!previewTest || !backend_url) return;
        setRegeneratingQuestionId(questionId);
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.post(`${backend_url}/api/admin/mock/regenerate-question`, {
                testId: previewTest._id,
                questionId
            });
            if (data.success && data.test) {
                setPreviewTest(data.test);
                setValidationReport(prev => prev.filter(issue => issue.questionId !== questionId));
                setRecentGenerations(prev => prev.map(gen => gen._id === data.test._id ? data.test : gen));
                toast.success("Question regenerated successfully!");
            } else {
                toast.error(data.message || "Failed to regenerate question.");
            }
        } catch (err) {
            console.error("Regenerate question error:", err);
            toast.error(`Regenerate question error: ${err.message}`);
        } finally {
            setRegeneratingQuestionId(null);
        }
    };

    return (
        <div className=' overflow-hidden'>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">Test Generator</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- LEFT SIDE: FORM --- */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-800 space-y-6 shadow-lg dark:shadow-none transition-colors">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="test-title" className="block text-sm font-medium text-gray-900 dark:text-slate-300 transition-colors">Test Title</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" id="test-title" className="mt-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors" placeholder="e.g., Full Mock Test #5" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="exam-category" className="block text-sm font-medium text-gray-900 dark:text-slate-300 transition-colors">Exam Category</label>
                                <select id="exam-category" value={selectedCategory} onChange={handleCategoryChange} className="mt-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition-colors">
                                    <option value="">Select Category</option>
                                    {examCatList.map(cat => <option key={cat._id} value={cat._id}>{cat.Name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="exam-name" className="block text-sm font-medium text-gray-900 dark:text-slate-300 transition-colors">Exam</label>
                                <select id="exam-name" value={selectedExam} onChange={handleExamChange} disabled={!selectedCategory || availableExams.length === 0} className="mt-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:bg-gray-200 dark:disabled:bg-slate-700 transition-colors">
                                    <option value="">{selectedCategory ? 'Select Exam' : 'Select Category First'}</option>
                                    {availableExams.map(exam => <option key={exam._id} value={exam._id}>{exam.Name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-slate-300 transition-colors">Difficulty</label>
                            <div className="flex space-x-2 mt-1">
                                <button type="button" onClick={() => setDifficulty('Easy')} className={`px-3 py-2.5 rounded-lg font-medium text-sm w-full transition-colors ${difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 ring-2 ring-green-500' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>Easy</button>
                                <button type="button" onClick={() => setDifficulty('Medium')} className={`px-3 py-2.5 rounded-lg font-medium text-sm w-full transition-colors ${difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 ring-2 ring-yellow-500' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>Medium</button>
                                <button type="button" onClick={() => setDifficulty('Hard')} className={`px-3 py-2.5 rounded-lg font-medium text-sm w-full transition-colors ${difficulty === 'Hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 ring-2 ring-red-500' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>Hard</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="marks-per-question" className="block text-sm font-medium text-gray-900 dark:text-slate-300 transition-colors">Marks per Question</label>
                                <input type="number" id="marks-per-question" value={marksPerQuestion} onChange={(e) => setMarksPerQuestion(e.target.value)} className="mt-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors" placeholder="e.g., 1" step="0.1" min="0.1" />
                            </div>
                            <div>
                                <label htmlFor="negative-marks" className="block text-sm font-medium text-gray-900 dark:text-slate-300 transition-colors">Negative Marks</label>
                                <input type="number" id="negative-marks" value={negativeMarks} onChange={(e) => setNegativeMarks(e.target.value)} className="mt-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-colors" placeholder="e.g., 0.25" step="0.01" />
                            </div>
                        </div>
                    </div>
                    <hr className="dark:border-slate-800" />
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Subjects Breakdown</h4>
                            {isAiLoadingCounts && <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5"><Sparkles size={12} /> AI analyzing syllabus...</span>}
                        </div>
                        <div id="subject-list" className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                            {subjects.map((s, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div className="md:col-span-3"><label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-400 transition-colors">Subject Name</label><input type="text" value={s.name} onChange={e => handleSubjectChange(i, 'name', e.target.value)} className="subject-name bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5 transition-colors" placeholder="e.g., General Knowledge" /></div>
                                    <div className="md:col-span-1"><label className="block mb-1 text-xs font-medium text-gray-700 dark:text-slate-400 transition-colors"># Questions</label><input type="number" min="1" value={s.count} onChange={e => handleSubjectChange(i, 'count', e.target.value)} className="num-questions bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5 transition-colors" /></div>
                                    <button onClick={() => handleRemoveSubject(i)} className="text-red-500 hover:text-red-700 p-2.5 bg-gray-100 dark:bg-slate-800 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddSubject} className="mt-4 bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 flex items-center text-sm transition-colors"><Plus size={16} className="mr-2" /> Add Subject</button>
                        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm flex flex-wrap gap-3 justify-between items-center transition-colors">
                            <div><span className="font-semibold text-indigo-800 dark:text-indigo-400">Total Subjects:</span><span className="font-bold text-indigo-900 dark:text-white ml-2">{subjects.length}</span></div>
                            <div><span className="font-semibold text-indigo-800 dark:text-indigo-400">Total Questions:</span><span className="font-bold text-indigo-900 dark:text-white ml-2">{totalQuestions}</span></div>
                            <div><span className="font-semibold text-indigo-800 dark:text-indigo-400">Total Marks:</span><span className="font-bold text-indigo-900 dark:text-white ml-2">{totalQuestions * (parseFloat(marksPerQuestion) || 1)}</span></div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDE: AI GENERATION --- */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-800 shadow-lg dark:shadow-none transition-colors">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200 transition-colors">AI Generation</h3>
                    <p className="text-sm text-gray-500 mt-1">Click the button to start the AI-powered test creation process.</p>

                    <button onClick={handleGenerate} disabled={isLoading || !selectedExam || totalQuestions === 0 || !title} className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 flex items-center justify-center disabled:bg-indigo-400">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <Sparkles size={20} className="mr-2" />}
                        {isLoading ? `Generating (${progress.count}/${progress.total})...` : 'Generate with AI'}
                    </button>

                    {isLoading && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(progress.total > 0 ? (progress.count / progress.total) * 100 : 0)}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200 transition-colors">History</h3>
                        <div className="space-y-3 mt-4 max-h-[42dvh] overflow-y-auto custom-scrollbar pr-3">
                            {recentGenerations.length > 0 ? recentGenerations.map((gen, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition ${gen.Status === 'Published' ? 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40' : ''} ${gen.Status === 'Draft' ? 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40' : ''}`}>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white transition-colors">
                                            {gen.ExamId?.Name} - {gen.Title}
                                            <span className={`text-xs ml-4 rounded p-0.5 font-semibold transition-colors ${gen.Difficulty === 'Easy' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400' : gen.Difficulty === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/30  text-yellow-800 dark:text-yellow-400' : gen.Difficulty === 'Hard' ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400' : ''} `}>{gen.Difficulty}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 transition-colors">
                                            Generated On: {new Date(gen.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setPreviewTest(gen)} className="text-gray-500 hover:text-indigo-600" title="Preview"><Eye size={20} /></button>
                                        {gen.Status === 'Draft' && <button onClick={() => handlePublishGeneration(gen._id)} className="text-gray-500 hover:text-green-600" title="Publish">
                                            <CheckCircle size={20} />
                                        </button>}
                                        <button onClick={() => handleDeleteGeneration(gen._id)} className="text-gray-500 hover:text-red-600" title="Discard">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-gray-500">No tests generated yet.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={!!previewTest} onClose={() => { setPreviewTest(null); setValidationReport([]); }} title={previewTest?.ExamId?.Name + ' - ' + previewTest?.Title}>
                <div className="flex justify-between items-center mb-4 border-b dark:border-slate-800 pb-4 transition-color">
                    <div className="flex gap-2">
                        <button onClick={() => setPreviewLang('en')} className={`font-semibold py-2 px-5 rounded-lg text-sm transition-colors ${previewLang === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700'}`}>English</button>
                        <button onClick={() => setPreviewLang('hi')} className={`font-semibold py-2 px-5 rounded-lg text-sm transition-colors ${previewLang === 'hi' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700'}`}>हिन्दी (Hindi)</button>
                    </div>
                </div>

                <div className="prose prose-sm max-w-none mt-4">
                    <div className="space-y-6">
                        {previewTest?.Questions?.map((q, idx) => {
                            if (!q) return null;
                            const langData = (previewLang === 'hi' && q.hi) ? q.hi : q.en;
                            const fallbackLangData = q.en || q.hi;
                            const displayData = langData || fallbackLangData;
                            if (!displayData) return null;

                            const issue = validationReport.find(i => i.questionId === q._id);
                            const correctedLangData = (issue && issue.proposedCorrection) 
                                ? (previewLang === 'hi' ? issue.proposedCorrection.hi : issue.proposedCorrection.en)
                                : null;

                            const showBatchHeader = idx % 10 === 0;
                            const batchIndex = Math.floor(idx / 10) + 1;
                            const batchStart = idx + 1;
                            const batchEnd = Math.min(idx + 10, previewTest.Questions.length);
                            const batchQuestions = previewTest.Questions.slice(idx, idx + 10);
                            const isCurrentValidating = validatingBatchIndex === batchIndex;

                            return (
                                <React.Fragment key={q._id}>
                                    {showBatchHeader && (
                                        <div className="mt-8 mb-6 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-150 dark:border-purple-900/30 flex justify-between items-center transition-colors">
                                            <span className="text-sm font-bold text-purple-900 dark:text-purple-300">
                                                Batch {batchIndex}: Questions {batchStart} to {batchEnd}
                                            </span>
                                            <button
                                                disabled={validatingBatchIndex !== null}
                                                onClick={() => handleAIValidateBatch({ index: batchIndex, questions: batchQuestions })}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                                                    isCurrentValidating 
                                                        ? 'bg-purple-600 text-white animate-pulse'
                                                        : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                                                }`}
                                            >
                                                {isCurrentValidating ? (
                                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                                ) : (
                                                    <Sparkles size={14} />
                                                )}
                                                <span>Validate Batch Q{batchStart}-{batchEnd}</span>
                                            </button>
                                        </div>
                                    )}
                                    <div className="space-y-3 pb-6 border-b dark:border-slate-800 last:border-0 transition-colors">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                <p className="font-semibold text-gray-900 dark:text-white transition-colors">
                                                    <span className="text-indigo-650 dark:text-indigo-400 font-bold mr-2">Q{idx + 1}.</span>
                                                    {displayData.Question}
                                                </p>
                                                <ul className="list-none pl-4 space-y-1">
                                                    {displayData.options.map((opt, oi) => (
                                                        <li key={oi} className={`text-gray-700 dark:text-slate-300 transition-colors ${opt.isCorrect ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                                                            <strong className="mr-2 text-gray-900 dark:text-white transition-colors">{String.fromCharCode(65 + oi)}.</strong>{opt.text}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <p className="!mt-3 text-sm">
                                                    <strong className="text-green-700 dark:text-green-400 transition-colors">Answer: {displayData.answer}</strong>
                                                </p>
                                                <div className="!mt-1 prose-sm" dangerouslySetInnerHTML={{ __html: displayData.solution }} />
                                            </div>
                                            <button 
                                                onClick={() => handleRegenerateQuestion(q._id)}
                                                disabled={regeneratingQuestionId === q._id}
                                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-400 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 disabled:bg-gray-100 dark:disabled:bg-slate-800 cursor-pointer self-start shrink-0"
                                                title="Regenerate this question with AI"
                                            >
                                                {regeneratingQuestionId === q._id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-700 dark:border-indigo-400"></div>
                                                ) : (
                                                    <RefreshCw size={12} />
                                                )}
                                                <span>Regenerate</span>
                                            </button>
                                        </div>

                                        {issue && (
                                            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl space-y-3">
                                                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
                                                    <Sparkles size={16} />
                                                    <span>AI-Detected Issue:</span>
                                                </div>
                                                <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/10 p-2.5 rounded-lg border border-amber-200/50 dark:border-amber-900/20">{issue.issue}</p>

                                                {correctedLangData && (
                                                    <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 text-xs">
                                                        <div className="text-green-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider font-semibold">AI Proposed Correction:</div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{correctedLangData.Question}</p>
                                                        <ul className="list-none pl-3 space-y-1">
                                                            {correctedLangData.options.map((opt, oi) => (
                                                                <li key={oi} className={`text-gray-700 dark:text-slate-300 ${opt.isCorrect ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                                                                    <strong className="mr-1.5">{String.fromCharCode(65 + oi)}.</strong>{opt.text}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <p className="font-bold text-green-700 dark:text-emerald-400">Answer: {correctedLangData.answer}</p>
                                                        <div className="prose-xs text-slate-500" dangerouslySetInnerHTML={{ __html: correctedLangData.solution }} />
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleRegenerateQuestion(q._id)}
                                                        disabled={regeneratingQuestionId === q._id}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 disabled:bg-indigo-400 cursor-pointer"
                                                    >
                                                        {regeneratingQuestionId === q._id ? (
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                        ) : (
                                                            <Sparkles size={14} />
                                                        )}
                                                        Regenerate Question
                                                    </button>

                                                    {issue.proposedCorrection && (
                                                        <button 
                                                            onClick={() => handleApplyCorrection(q._id, issue.proposedCorrection)}
                                                            disabled={applyingCorrectionId === q._id}
                                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 disabled:bg-green-400 cursor-pointer"
                                                        >
                                                            {applyingCorrectionId === q._id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                            ) : (
                                                                <CheckCircle size={14} />
                                                            )}
                                                            Apply AI Correction
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TestGenerator;