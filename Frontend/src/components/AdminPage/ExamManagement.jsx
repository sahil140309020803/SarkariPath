import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Folder, FileText, Edit2, Sparkles, X, BookOpen, Eye, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import { useExam } from '../../context/ExamContext';
import axios from 'axios';
import { toast } from "react-toastify";

const ExamManagement = () => {
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);

    // Edit Modes
    const [isEditCatMode, setIsEditCatMode] = useState(false);
    const [editingCatId, setEditingCatId] = useState(null);
    const [isEditExamMode, setIsEditExamMode] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);

    const [topicsMap, setTopicsMap] = useState({});

    // Topic Popup States
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [currentTopicSubject, setCurrentTopicSubject] = useState('');
    const [currentTopicsList, setCurrentTopicsList] = useState([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [newManualTopic, setNewManualTopic] = useState('');

    const [activeCatSection, setActiveCatSection] = useState({});
    const [subjects, setSubjects] = useState([]);
    const [newManualSubject, setNewManualSubject] = useState('');
    const [isGeneratingSubjects, setIsGeneratingSubjects] = useState(false);

    // Mock Tests List State
    const [isMocksModalOpen, setIsMocksModalOpen] = useState(false);
    const [selectedExamMocks, setSelectedExamMocks] = useState([]);
    const [selectedExamForMocks, setSelectedExamForMocks] = useState(null);
    const [previewTest, setPreviewTest] = useState(null);
    const [previewLang, setPreviewLang] = useState('en');

    const [Exam, setExam] = useState('');

    const [newCategory, setNewCategory] = useState({
        Name: '',
        Description: ''
    });

    const { examCatList, backend_url, setIsCatUpdated, isCatUpdated } = useExam();

    useEffect(() => {
        if (examCatList && examCatList.length > 0) {
            if (activeCatSection._id) {
                const updatedActiveCat = examCatList.find(cat => cat._id === activeCatSection._id);
                setActiveCatSection(updatedActiveCat || examCatList[0]);
            } else {
                setActiveCatSection(examCatList[0]);
            }
        }
    }, [examCatList, isCatUpdated]);

    // Subjects Handlers
    const addManualSubject = () => {
        if (newManualSubject.trim() !== '' && !subjects.includes(newManualSubject.trim())) {
            setSubjects([...subjects, newManualSubject.trim()]);
            setNewManualSubject('');
        } else if (subjects.includes(newManualSubject.trim())) {
            toast.warning("Subject already exists", { autoClose: 1000 });
        }
    };

    const handleAIGenerateSubjects = async () => {
        if (!Exam.trim()) {
            toast.error("Please enter the Exam Name first to generate subjects.");
            return;
        }
        setIsGeneratingSubjects(true);
        try {
            const { data } = await axios.post(`${backend_url}/api/exams/ai/generate-subjects`, { examName: Exam });
            if (data.success) {
                const merged = new Set([...subjects.filter(s => s.trim() !== ''), ...data.subjects]);
                setSubjects(Array.from(merged));
                toast.success('Successfully generated subjects!', { autoClose: 1000 });
            } else {
                toast.error(data.message || 'AI Generation failed');
            }
        } catch (err) {
            toast.error('Failed to communicate with AI endpoint');
        } finally {
            setIsGeneratingSubjects(false);
        }
    };

    const removeSubjectField = (index) => {
        const subToRemove = subjects[index];
        setSubjects(subjects.filter((_, i) => i !== index));
        // optional cleanup:
        setTopicsMap(prev => {
            const newMap = { ...prev };
            delete newMap[subToRemove];
            return newMap;
        });
    };

    // Category Handlers
    const handleAddCategory = async (e) => {
        e.preventDefault();
        axios.defaults.withCredentials = true;
        try {
            const endpoint = isEditCatMode
                ? `${backend_url}/api/exam-category/edit-category/${editingCatId}`
                : `${backend_url}/api/exam-category/add-category`;

            const req = isEditCatMode ? axios.put(endpoint, newCategory) : axios.post(endpoint, newCategory);
            const { data } = await req;

            if (data.success) {
                toast.success(data.message, { autoClose: 1000 });
                setIsCatUpdated(prev => !prev);
                closeCatModal();
            } else {
                toast.error(data.message, { autoClose: 1000 });
            }
        } catch (err) {
            console.error('Category error:', err);
            toast.error("Failed to process category request.", { autoClose: 1000 });
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/exam-category/delete-category/${categoryId}`);
            if (data.success) {
                toast.success(data.message, { autoClose: 1000 });
                setIsCatUpdated(prev => !prev);
            } else toast.error(data.message, { autoClose: 1000 });
        } catch (err) {
            console.error('Delete category err:', err);
            toast.error("Failed to delete category.", { autoClose: 1000 });
        }
    };

    const openEditCatModal = (cat, e) => {
        e.stopPropagation();
        setIsEditCatMode(true);
        setEditingCatId(cat._id);
        setNewCategory({ Name: cat.Name, Description: cat.Description });
        setIsCatModalOpen(true);
    };

    const closeCatModal = () => {
        setIsCatModalOpen(false);
        setIsEditCatMode(false);
        setEditingCatId(null);
        setNewCategory({ Name: '', Description: '' });
    };

    // Topics Modal Logic
    const openTopicModal = (subjectName) => {
        if (!Exam.trim()) {
            toast.error("Please enter the Exam Name first.");
            return;
        }
        setCurrentTopicSubject(subjectName);
        setCurrentTopicsList(topicsMap[subjectName] || []);
        setIsTopicModalOpen(true);
    };

    const closeTopicModal = () => {
        setIsTopicModalOpen(false);
        setCurrentTopicSubject('');
        setCurrentTopicsList([]);
        setNewManualTopic('');
    };

    const saveTopicsToMap = () => {
        setTopicsMap(prev => ({ ...prev, [currentTopicSubject]: currentTopicsList }));
        toast.success(`Topics saved for ${currentTopicSubject}`, { autoClose: 1000 });
        closeTopicModal();
    };

    const handleAIGenerateTopics = async () => {
        setIsGeneratingAI(true);
        try {
            const { data } = await axios.post(`${backend_url}/api/exams/ai/generate-topics`, { examName: Exam, subjectName: currentTopicSubject });
            if (data.success) {
                const merged = new Set([...currentTopicsList, ...data.topics]);
                setCurrentTopicsList(Array.from(merged));
                toast.success('Successfully generated topics!', { autoClose: 1000 });
            } else {
                toast.error(data.message || 'AI Generation failed');
            }
        } catch (err) {
            toast.error('Failed to communicate with AI endpoint');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const addManualTopic = () => {
        if (newManualTopic.trim() !== '') {
            setCurrentTopicsList([...currentTopicsList, newManualTopic.trim()]);
            setNewManualTopic('');
        }
    };

    const removeTopic = (indexToRemove) => {
        setCurrentTopicsList(currentTopicsList.filter((_, idx) => idx !== indexToRemove));
    };

    // Exam Handlers
    const handleAddExam = async (e) => {
        e.preventDefault();
        if (!activeCatSection._id) {
            toast.error("Please select a category first.", { autoClose: 1000 });
            return;
        }
        axios.defaults.withCredentials = true;
        const examData = {
            CategoryId: activeCatSection._id,
            Name: Exam,
            Subjects: subjects.filter(sub => sub.trim() !== ''),
            Topics: topicsMap
        };
        try {
            const endpoint = isEditExamMode ? `${backend_url}/api/exams/edit-exam/${editingExamId}` : `${backend_url}/api/exams/add-exam`;
            const req = isEditExamMode ? axios.put(endpoint, examData) : axios.post(endpoint, examData);

            const { data } = await req;
            if (data.success) {
                toast.success(data.message, { autoClose: 1000 });
                setIsCatUpdated(prev => !prev);
                closeExamModal();
            } else toast.error(data.message, { autoClose: 1000 });
        } catch (err) {
            console.error('Exam err:', err);
            toast.error("Failed to process exam request.", { autoClose: 1000 });
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/exams/delete-exam/${examId}`);
            if (data.success) {
                toast.success(data.message, { autoClose: 1000 });
                setIsCatUpdated(prev => !prev);
            } else toast.error(data.message, { autoClose: 1000 });
        } catch (err) {
            console.error('Delete exam err:', err);
            toast.error("Failed to delete exam.", { autoClose: 1000 });
        }
    };

    const openEditExamModal = (exam, e) => {
        e.stopPropagation();
        setIsEditExamMode(true);
        setEditingExamId(exam._id);
        setExam(exam.Name);
        setSubjects(exam.Subjects && exam.Subjects.length ? exam.Subjects : []);
        setTopicsMap(exam.Topics || {});
        setIsExamModalOpen(true);
    };

    const closeExamModal = () => {
        setIsExamModalOpen(false);
        setIsEditExamMode(false);
        setEditingExamId(null);
        setExam('');
        setSubjects([]);
        setNewManualSubject('');
        setTopicsMap({});
    };

    // View Mocks Handlers
    const openMocksModal = async (exam, e) => {
        e.stopPropagation();
        setSelectedExamForMocks(exam);
        setIsMocksModalOpen(true);
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/admin/test-generations/exam/${exam._id}`);
            if (data.success) {
                setSelectedExamMocks(data.mocks);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to fetch mock tests");
        }
    };

    const closeMocksModal = () => {
        setIsMocksModalOpen(false);
        setSelectedExamForMocks(null);
        setSelectedExamMocks([]);
    };

    const handleDeleteMock = async (testId) => {
        if (!window.confirm("Are you sure you want to delete this mock test?")) return;
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/admin/test-generations/delete/${testId}`);
            if (data.success) {
                toast.success("Mock test deleted", { autoClose: 1000 });
                setSelectedExamMocks(prev => prev.filter(m => m._id !== testId));
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to delete mock test");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight transition-colors">Exam Management</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative w-full">
                {/* Decorative background blurs */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                {/* Category Section */}
                <div className='relative flex flex-col p-6 rounded-3xl space-y-4 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200/60 dark:border-slate-700/50 w-full lg:col-span-5 min-h-[15rem] h-[32rem] transition-colors overflow-hidden'>
                    <div className='flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-700/50 transition-colors z-10'>
                        <div className='flex items-center gap-3 font-extrabold text-xl text-slate-800 dark:text-slate-100 transition-colors'><Folder className="text-indigo-500 drop-shadow-sm" /> Categories</div>
                        <button onClick={() => setIsCatModalOpen(true)} className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300">
                            <Plus size={18} className="mr-1.5" /> Add Category
                        </button>
                    </div>
                    <div className='space-y-3.5 overflow-y-auto max-h-[24rem] pr-2 custom-scrollbar z-10 pt-2'>
                        {examCatList && examCatList.map(cat => (
                            <div key={cat._id} onClick={() => setActiveCatSection(cat)} className={`flex justify-between items-center p-5 rounded-2xl transition-all duration-300 cursor-pointer group flex-shrink-0 ${activeCatSection._id === cat._id ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border border-transparent text-white' : 'bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:-translate-y-0.5 hover:shadow-md'}`}>
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <h3 className="font-semibold">{cat.Name}</h3>
                                        {activeCatSection._id !== cat._id && <p className="text-xs text-slate-400 mt-1">{cat.Exams?.length || 0} Exams</p>}
                                    </div>
                                </div>
                                <div className="flex gap-2 group-hover:opacity-100 opacity-0 transition-opacity">
                                    <button onClick={(e) => openEditCatModal(cat, e)} className={`${activeCatSection._id === cat._id ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-indigo-600'} transition`}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }} className={`${activeCatSection._id === cat._id ? 'text-indigo-200 hover:text-red-200' : 'text-slate-400 hover:text-red-500'} transition`}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exams Section */}
                <div className='flex flex-col p-6 rounded-2xl shadow-xl dark:shadow-none space-y-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 w-full lg:col-span-7 min-h-[15rem] h-[32rem] transition-colors'>
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center transition-colors">
                        <div>
                            <div className='flex items-center gap-3 font-bold text-lg text-slate-700 dark:text-slate-200 transition-colors'>🎓 Exams: {activeCatSection?.Name || 'Select Category'}</div>
                            <div className='text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors'>{activeCatSection?.Description}</div>
                        </div>
                        {activeCatSection?._id && (
                            <button onClick={() => setIsExamModalOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white shadow rounded-xl hover:bg-indigo-700 transition">
                                <Plus size={18} className="mr-2" /> Add
                            </button>
                        )}
                    </div>
                    {(!activeCatSection?.Exams || activeCatSection.Exams.length === 0) ? (
                        <div className='text-slate-400 h-full flex flex-col justify-center items-center'>
                            <FileText size={48} strokeWidth={1} className="mb-4 text-slate-300" />
                            <div className='font-medium'>No Exams Available</div>
                        </div>
                    ) : (
                        <div className='space-y-3 pt-2 overflow-y-auto h-full pr-2 custom-scrollbar'>
                            {activeCatSection.Exams.map((exam, index) => (
                                <div key={index} className='p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md dark:hover:shadow-none hover:bg-white dark:hover:bg-slate-700/80 transition-all duration-200 group flex justify-between items-center'>
                                    <div className='flex gap-4 items-center'>
                                        <div className='rounded-lg p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 transition-colors'><FileText size={20} /></div>
                                        <div>
                                            <div className='font-bold text-slate-800 dark:text-slate-200 transition-colors'>{exam.Name}</div>
                                            <div className='text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors'>{exam.Subjects?.length || 0} Subjects</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 group-hover:opacity-100 opacity-0 transition-opacity">
                                        <button onClick={(e) => openMocksModal(exam, e)} className="text-slate-400 hover:text-emerald-600 transition" title="View Mock Tests">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={(e) => openEditExamModal(exam, e)} className="text-slate-400 hover:text-indigo-600 transition">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteExam(exam._id)} className="text-slate-400 hover:text-red-500 transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Exam Modal */}
            <Modal isOpen={isExamModalOpen} onClose={closeExamModal} title={isEditExamMode ? "Edit Exam" : "Add New Exam"} maxWidth="max-w-lg">
                <form onSubmit={handleAddExam} className='flex flex-col gap-4 mt-2'>
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">Exam Name</label>
                        <input value={Exam} onChange={(e) => setExam(e.target.value)} type="text" placeholder="e.g., Combined Graduate Level Exam" className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full p-2.5 transition" required />
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">Subjects</label>

                        {/* AI Generation Button */}
                        <button type="button" onClick={handleAIGenerateSubjects} disabled={isGeneratingSubjects} className={`w-full mb-3 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white shadow-sm transition-all ${isGeneratingSubjects ? 'bg-indigo-400 animate-pulse cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:-translate-y-0.5'}`}>
                            <Sparkles size={16} className={isGeneratingSubjects ? 'animate-spin' : ''} />
                            {isGeneratingSubjects ? 'Generating Subjects via AI...' : 'Generate Subjects via AI ✨'}
                        </button>

                        {/* Manual Add Input */}
                        <div className="flex items-center gap-2 mb-3">
                            <input type="text" value={newManualSubject} onChange={(e) => setNewManualSubject(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addManualSubject(); } }} placeholder="Manually add a subject..." className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full p-2.5 transition text-sm" />
                            <button type="button" onClick={addManualSubject} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition">
                                Add
                            </button>
                        </div>

                        {/* Subject Cards List */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 min-h-[10rem] max-h-[14rem] overflow-y-auto custom-scrollbar">
                            {subjects.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-70 mt-4">
                                    <BookOpen size={24} className="mb-2" />
                                    <span className="text-sm">No subjects added.</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {subjects.map((subject, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 p-3 rounded-xl shadow-sm transition hover:border-slate-300 dark:hover:border-slate-500">
                                            <span className="font-semibold text-sm">{subject}</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => openTopicModal(subject)} className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/40 transition flex items-center gap-1">
                                                    <Sparkles size={14} /> Topics
                                                    {topicsMap[subject] && topicsMap[subject].length > 0 && (
                                                        <span className="bg-indigo-600 text-white rounded-full px-1.5 py-0.5 text-[10px] ml-1 leading-none">{topicsMap[subject].length}</span>
                                                    )}
                                                </button>
                                                <button type="button" onClick={() => removeSubjectField(index)} className="text-slate-400 hover:text-red-500 transition bg-slate-100 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-500/20 rounded p-1.5">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                        <button type="button" onClick={closeExamModal} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-xl hover:bg-indigo-700 transition">Save Exam</button>
                    </div>
                </form>
            </Modal>

            {/* Category Modal */}
            <Modal isOpen={isCatModalOpen} onClose={closeCatModal} title={isEditCatMode ? "Edit Category" : "Add New Category"} maxWidth="max-w-lg">
                <form onSubmit={handleAddCategory} className='flex flex-col gap-4 mt-2'>
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">Category Name</label>
                        <input type="text" value={newCategory.Name} onChange={(e) => setNewCategory({ ...newCategory, Name: e.target.value })} className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full p-2.5 transition" required placeholder="e.g. Banking" />
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                        <textarea value={newCategory.Description} onChange={(e) => setNewCategory({ ...newCategory, Description: e.target.value })} className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full p-2.5 transition h-24 resize-none" required placeholder="Brief description..."></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                        <button type="button" onClick={closeCatModal} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-xl hover:bg-indigo-700 transition">Save Category</button>
                    </div>
                </form>
            </Modal>

            {/* Topic Modal */}
            <Modal isOpen={isTopicModalOpen} onClose={closeTopicModal} title={`Manage Topics: ${currentTopicSubject}`} maxWidth="max-w-xl">
                <div className='flex flex-col gap-4 mt-2'>
                    {/* AI Generation Button */}
                    <button type="button" onClick={handleAIGenerateTopics} disabled={isGeneratingAI} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white shadow-md transition-all ${isGeneratingAI ? 'bg-indigo-400 animate-pulse cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-lg'}`}>
                        <Sparkles size={18} className={isGeneratingAI ? 'animate-spin' : ''} />
                        {isGeneratingAI ? 'Generating Topics via AI...' : 'Generate Topics via AI 🪄'}
                    </button>

                    {/* Manual Add */}
                    <div className="flex items-center gap-2 mt-2">
                        <input type="text" value={newManualTopic} onChange={(e) => setNewManualTopic(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addManualTopic(); } }} placeholder="Manually add a topic..." className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full p-2.5 transition text-sm" />
                        <button type="button" onClick={addManualTopic} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition">
                            Add
                        </button>
                    </div>

                    {/* Topics List */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 min-h-[12rem] max-h-[16rem] overflow-y-auto custom-scrollbar mt-2">
                        {currentTopicsList.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-70 mt-6">
                                <BookOpen size={32} className="mb-2" />
                                <span className="text-sm">No topics added yet. Generate with AI or add manually.</span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {currentTopicsList.map((topic, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm shadow-sm transition hover:border-slate-300 dark:hover:border-slate-500">
                                        <span>{topic}</span>
                                        <button type="button" onClick={() => removeTopic(idx)} className="text-slate-400 hover:text-red-500 ml-1 transition bg-slate-100 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-500/20 rounded pl-0.5 pr-0.5">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                        <button type="button" onClick={closeTopicModal} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                        <button type="button" onClick={saveTopicsToMap} className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 dark:bg-emerald-500 rounded-xl hover:bg-emerald-700 transition shadow-md">Save Topics</button>
                    </div>
                </div>
            </Modal>

            {/* Mocks List Modal */}
            <Modal isOpen={isMocksModalOpen} onClose={closeMocksModal} title={`Published Mock Tests: ${selectedExamForMocks?.Name}`} maxWidth="max-w-2xl">
                <div className="mt-2 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedExamMocks.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No mock tests found for this exam.</div>
                    ) : (
                        selectedExamMocks.map((gen, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-sm">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{gen.Title}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${gen.Difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : gen.Difficulty === 'Hard' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{gen.Difficulty}</span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Created: {new Date(gen.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPreviewTest(gen)} className="p-2 bg-white dark:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl border border-slate-200 dark:border-slate-600 transition-all shadow-sm" title="Preview"><Eye size={18} /></button>
                                    <button onClick={() => handleDeleteMock(gen._id)} className="p-2 bg-white dark:bg-slate-700 text-slate-500 hover:text-rose-500 rounded-xl border border-slate-200 dark:border-slate-600 transition-all shadow-sm" title="Delete"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            {/* Preview Modal */}
            <Modal isOpen={!!previewTest} onClose={() => setPreviewTest(null)} title={`${selectedExamForMocks?.Name} - ${previewTest?.Title}`} maxWidth="max-w-4xl">
                <div className="flex justify-center gap-3 mb-6 border-b dark:border-slate-700 pb-5">
                    <button onClick={() => setPreviewLang('en')} className={`font-bold py-2.5 px-6 rounded-xl text-sm transition-all ${previewLang === 'en' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>English</button>
                    <button onClick={() => setPreviewLang('hi')} className={`font-bold py-2.5 px-6 rounded-xl text-sm transition-all ${previewLang === 'hi' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>हिन्दी (Hindi)</button>
                </div>

                <div className="max-h-[65vh] overflow-y-auto px-2 custom-scrollbar">
                    <div className="space-y-8">
                        {previewTest?.Questions?.map((q, idx) => {
                            if (!q) return null;
                            const langData = (previewLang === 'hi' && q.hi) ? q.hi : q.en;
                            const fallbackLangData = q.en || q.hi;
                            const displayData = langData || fallbackLangData;
                            if (!displayData) return null;

                            return (
                                <div key={q._id} className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors"></div>
                                    <p className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-4 leading-relaxed"><span className="text-indigo-500 mr-2">Q{idx + 1}.</span>{displayData.Question}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 sm:pl-4">
                                        {displayData.options.map((opt, oi) => (
                                            <div key={oi} className={`flex items-center p-3 rounded-xl border transition-all ${opt.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'}`}>
                                                <span className="font-extrabold mr-3 text-sm opacity-60">{String.fromCharCode(65 + oi)}.</span>
                                                <span className="text-sm font-medium">{opt.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold w-full max-w-max">
                                            <CheckCircle size={16} className="shrink-0" /> <span>Correct Answer: {displayData.answer}</span>
                                        </div>
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                            <p className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider mb-2">Solution Explanation</p>
                                            <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: displayData.solution }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ExamManagement;