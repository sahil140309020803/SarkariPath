import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Eye, CheckCircle, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import { useExam } from '../../context/ExamContext';
import Modal from './Modal';

const TestGenerator = () => {
    const { examCatList, backend_url } = useExam();
    
    const [socket, setSocket] = useState(null);
    const [subjects, setSubjects] = useState([{ name: '', count: 1 }]);
    const [recentGenerations, setRecentGenerations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previewTest, setPreviewTest] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [availableExams, setAvailableExams] = useState([]);
    const [title, setTitle] = useState('');
    const [negativeMarks, setNegativeMarks] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [previewLang, setPreviewLang] = useState('en');
    const [progress, setProgress] = useState({ count: 0, total: 0 });

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
            setPreviewTest(newTest);
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

    const handleExamChange = (e) => setSelectedExam(e.target.value);
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
        
        socket.emit('start_generation', {
            title,
            examId: selectedExam,
            rules: subjects.filter(s => s.name && s.count > 0),
            difficulty,
            negativeMarks: parseFloat(negativeMarks) || 0,
            duration: 60,
            totalMarks: totalQuestions
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Test Generator</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- LEFT SIDE: FORM --- */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6 shadow-lg">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="test-title" className="block text-sm font-medium text-gray-900">Test Title</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" id="test-title" className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" placeholder="e.g., Full Mock Test #5" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="exam-category" className="block text-sm font-medium text-gray-900">Exam Category</label>
                                <select id="exam-category" value={selectedCategory} onChange={handleCategoryChange} className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3">
                                    <option value="">Select Category</option>
                                    {examCatList.map(cat => <option key={cat._id} value={cat._id}>{cat.Name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="exam-name" className="block text-sm font-medium text-gray-900">Exam</label>
                                <select id="exam-name" value={selectedExam} onChange={handleExamChange} disabled={!selectedCategory || availableExams.length === 0} className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 disabled:bg-gray-200">
                                    <option value="">{selectedCategory ? 'Select Exam' : 'Select Category First'}</option>
                                    {availableExams.map(exam => <option key={exam._id} value={exam._id}>{exam.Name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Difficulty</label>
                                <div className="flex space-x-2 mt-1">
                                    <button type="button" onClick={() => setDifficulty('Easy')} className={`px-3 py-2.5 rounded-lg font-medium text-sm w-full transition-colors ${difficulty === 'Easy' ? 'bg-green-100 text-green-800 ring-2 ring-green-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Easy</button>
                                    <button type="button" onClick={() => setDifficulty('Medium')} className={`px-3 py-2.5 rounded-lg font-medium text-sm w-full transition-colors ${difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Medium</button>
                                    <button type="button" onClick={() => setDifficulty('Hard')} className={`px-3 py-2.5 rounded-lg font-medium text-sm w-full transition-colors ${difficulty === 'Hard' ? 'bg-red-100 text-red-800 ring-2 ring-red-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Hard</button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="negative-marks" className="block text-sm font-medium text-gray-900">Negative Marks</label>
                                <input type="number" id="negative-marks" value={negativeMarks} onChange={(e) => setNegativeMarks(e.target.value)} className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" placeholder="e.g., 0.25" step="0.01" />
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div>
                        <div id="subject-list" className="space-y-4">
                            {subjects.map((s, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div className="md:col-span-3"><label className="block mb-1 text-xs font-medium text-gray-700">Subject Name</label><input type="text" value={s.name} onChange={e => handleSubjectChange(i, 'name', e.target.value)} className="subject-name bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="e.g., General Knowledge" /></div>
                                    <div className="md:col-span-1"><label className="block mb-1 text-xs font-medium text-gray-700"># Questions</label><input type="number" min="1" value={s.count} onChange={e => handleSubjectChange(i, 'count', e.target.value)} className="num-questions bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" /></div>
                                    <button onClick={() => handleRemoveSubject(i)} className="text-red-500 hover:text-red-700 p-2.5 bg-gray-100 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddSubject} className="mt-4 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 flex items-center text-sm"><Plus size={16} className="mr-2" /> Add Subject</button>
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm flex justify-between items-center">
                            <div><span className="font-semibold text-indigo-800">Total Subjects:</span><span className="font-bold text-indigo-900 ml-2">{subjects.length}</span></div>
                            <div><span className="font-semibold text-indigo-800">Total Questions:</span><span className="font-bold text-indigo-900 ml-2">{totalQuestions}</span></div>
                        </div>
                    </div>
                </div>
                
                {/* --- RIGHT SIDE: AI GENERATION --- */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-700">AI Generation</h3>
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
                        <h3 className="text-xl font-semibold text-gray-700">Recent Generations</h3>
                        <div className="space-y-3 mt-4">
                            {recentGenerations.length > 0 ? recentGenerations.map((gen, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                                    <div><p className="font-semibold text-gray-900">{gen.title}</p><p className="text-xs text-gray-500">Generated on: {gen.date.toLocaleTimeString()}</p></div>
                                    <div className="flex items-center gap-3"><button onClick={() => setPreviewTest(gen)} className="text-gray-500 hover:text-indigo-600" title="Preview"><Eye size={20} /></button><button className="text-gray-500 hover:text-green-600" title="Publish"><CheckCircle size={20} /></button><button className="text-gray-500 hover:text-red-600" title="Discard"><Trash2 size={20} /></button></div>
                                </div>
                            )) : <p className="text-sm text-gray-500">No tests generated yet.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={!!previewTest} onClose={() => setPreviewTest(null)} title={previewTest?.title}>
                <div className="flex justify-center gap-2 mb-4 border-b pb-4">
                    <button onClick={() => setPreviewLang('en')} className={`font-semibold py-2 px-5 rounded-lg text-sm ${previewLang === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>English</button>
                    <button onClick={() => setPreviewLang('hi')} className={`font-semibold py-2 px-5 rounded-lg text-sm ${previewLang === 'hi' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>हिन्दी (Hindi)</button>
                </div>
                
                <div className="prose prose-sm max-w-none">
                    <ol className="list-decimal pl-5 space-y-6">
                        {previewTest?.content?.Questions?.map((q) => {
                            if (!q) return null;
                            const langData = (previewLang === 'hi' && q.hi) ? q.hi : q.en;
                            const fallbackLangData = q.en || q.hi;
                            const displayData = langData || fallbackLangData;
                            if (!displayData) return null;

                            return (
                                <li key={q._id} className="space-y-2 pb-2">
                                    <p className="font-semibold text-gray-900">{displayData.Question}</p>
                                    <ul className="list-none pl-4 space-y-1">
                                        {displayData.options.map((opt, oi) => (
                                            <li key={oi} className="text-gray-700">
                                                <strong className="mr-2 text-gray-900">{String.fromCharCode(65 + oi)}.</strong>{opt.text}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="!mt-3 text-sm">
                                        <strong className="text-green-700">Answer: {displayData.answer}</strong>
                                    </p>
                                    <div className="!mt-1 prose-sm" dangerouslySetInnerHTML={{ __html: displayData.solution }} />
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </Modal>
        </div>
    );
};

export default TestGenerator;