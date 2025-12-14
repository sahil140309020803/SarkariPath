import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Folder, FileText } from 'lucide-react';
import Modal from './Modal';
import { useExam } from '../../context/ExamContext';
import axios from 'axios';
import { toast } from "react-toastify";

const ExamManagement = () => {
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [activeCatSection, setActiveCatSection] = useState({});
    const [subjects, setSubjects] = useState(['']);
    const [Exam, setExam] = useState('');

    const addSubjectField = () => {
        setSubjects([...subjects, '']);
    };
    const removeSubjectField = (index) => {
        const updatedSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(updatedSubjects);
    };
    const handleSubjectChange = (index, value) => {
        const updatedSubjects = [...subjects];
        updatedSubjects[index] = value;
        setSubjects(updatedSubjects);
    };

    const [newCategory, setNewCategory] = useState({
        icon: '',
        Name: '',
        Description: ''
    });
    const { examCatList, backend_url, setIsCatUpdated, isCatUpdated } = useExam();

    useEffect(() => {
        if (examCatList && examCatList.length > 0) {
            const updatedActiveCat = examCatList.find(cat => cat._id === activeCatSection._id);
            setActiveCatSection(updatedActiveCat || examCatList[0]);
        }
    }, [examCatList, isCatUpdated]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.post(`${backend_url}/api/exam-category/add-category`, newCategory);
            if (data.success) {
                toast.success(data.message, {
                    autoClose: 1000
                });
                setIsCatUpdated(prev => !prev);
                setIsCatModalOpen(false);
                setNewCategory({ icon: '', Name: '', Description: '' });
            } else {
                toast.error(data.message, {
                    autoClose: 1000
                });
            }
        } catch (err) {
            console.error('Failed to add category:', err);
            toast.error("Failed to add category.", {
                autoClose: 1000
            });
        }
    };

    

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/exam-category/delete-category/${categoryId}`);
            if (data.success) {
                toast.success(data.message, {
                    autoClose: 1000
                });
                setIsCatUpdated(prev => !prev);
            } else {
                toast.error(data.message, {
                    autoClose: 1000
                });
            }
        } catch (err) {
            console.error('Failed to delete category:', err);
            toast.error("Failed to delete category.", {
                autoClose: 1000
            });
        }
    };

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
            Subjects: subjects.filter(sub => sub.trim() !== '')
        };
        try {
            const { data } = await axios.post(`${backend_url}/api/exams/add-exam`, examData);
            if (data.success) {
                toast.success(data.message, { autoClose: 1000 });
                setIsCatUpdated(prev => !prev);
                setIsExamModalOpen(false);
                setExam('');
                setSubjects(['']);
            } else {
                toast.error(data.message, { autoClose: 1000 });
            }
            console.log(data);
        } catch (err) {
            console.error('Failed to add exam:', err);
            toast.error("Failed to add exam.", { autoClose: 1000 });
        }
    }
    const handleDeleteExam = async (examId) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;
        axios.defaults.withCredentials = true;
        try {
            const { data } = await axios.get(`${backend_url}/api/exams/delete-exam/${examId}`);
            if (data.success) {
                toast.success(data.message, { autoClose: 1000 });
                setIsCatUpdated(prev => !prev);
            } else {
                toast.error(data.message, { autoClose: 1000 });
            }
        }
        catch (err) {
                console.error('Failed to delete exam:', err);
                toast.error("Failed to delete exam.", { autoClose: 1000 });
            }
        }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Exam Management</h2>

            </div>
            <div className="flex flex-wrap gap-10 items-center">
                {/* Exam Category Section */}
                <div className='p-5 rounded-2xl shadow-2xl space-y-4 bg-white min-w-[28rem] max-w-[31rem] min-h-[15rem] h-[28rem]'>
                    <div className='flex justify-between items-center'>
                        <div className='flex justify-center items-center gap-4 font-semibold text-[18px]'><Folder /> Exam Categories</div>
                        <button onClick={() => setIsCatModalOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            <Plus className="mr-2" /> Add New Category
                        </button>
                    </div>
                    <div className='space-y-2 overflow-y-auto max-h-[22rem]'>
                        {examCatList && examCatList.map(cat => (
                            <div key={cat._id} onClick={() => setActiveCatSection(cat)} className={`flex justify-between items-center p-4  rounded-lg shadow-md mr-2  cursor-pointer  transition-transform duration-200 group ${activeCatSection._id === cat._id ? 'bg-blue-700 text-white translate-x-2' : 'bg-gray-50 hover:bg-blue-50 hover:translate-x-1'}`}>
                                <div className="flex items-center space-x-4">
                                    <div className="text-[17px]">{cat.icon}</div>
                                    <div>
                                        <h3 className="text-[17px] font-medium">{cat.Name}</h3>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteCategory(cat._id)} className=" text-red-500 hover:text-red-700 group-hover:visible invisible  text-sm">
                                    <Trash2 />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exams Sections */}
                <div className='flex flex-col p-6 rounded-2xl shadow-2xl space-y-4 bg-white min-w-[30rem] w-[40rem] min-h-[15rem] h-[28rem]'>
                    <div>
                        <div className='flex justify-center items-center gap-4 font-semibold text-[18px]'>🎓 Exams - {activeCatSection.Name}</div>
                        <div className='text-gray-700 text-center'>{activeCatSection.Description}</div>
                    </div>
                    <button onClick={() => setIsExamModalOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 self-center">
                        <Plus className="mr-2" /> Add New Exam
                    </button>
                    {activeCatSection && !activeCatSection.Exams?.length && <div className='text-gray-500 text-center w-[100%] h-[75%] justify-center items-center flex'>
                        <div className='font-md text-xl'>
                            <div className='text-4xl'>📄</div>
                            <div>No Exams Available</div>
                        </div>
                    </div>}
                    {activeCatSection && activeCatSection.Exams?.length > 0 && <div className='space-y-2 pt-4 overflow-y-auto h-[18rem]'>
                        {activeCatSection.Exams.map((exam, index) => (
                            <div key={index} className='p-3 bg-gray-50 rounded-xl shadow-sm hover:-translate-y-1 hover:bg-blue-50 transition-all duration-200 cursor-pointer group
                            '>
                                <div className='flex justify-between items-center'>
                                    <div className='flex gap-4 items-center'>
                                        <div className='rounded-md p-2 bg-blue-100 text-2xl'><FileText className='text-blue-700' /></div>
                                        <div className='font-medium text-gray-800'>{exam.Name}</div>
                                    </div>
                                    <button onClick={() => handleDeleteExam(exam._id)} className=" text-red-500 hover:text-red-700  text-sm group-hover:visible invisible">
                                        <Trash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>
            </div>


            {/* Modal for adding a new exam*/}
            <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title="Add New Exam" maxWidth="max-w-lg">
                <form onSubmit={handleAddExam} className='flex flex-col gap-2'>
                    <div>
                        <label htmlFor="exam-name" className="block mb-2 text-sm font-medium text-gray-900">Exam Name</label>
                        <input
                            value={Exam} onChange={(e) => setExam(e.target.value)}
                            type="text"
                            id="exam-name"
                            placeholder="e.g., Combined Graduate Level Exam"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block focus:outline focus:outline-blue-400 w-full p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Subjects</label>
                        {subjects.map((subject, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Enter Subject Name"
                                    value={subject}
                                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block focus:outline focus:outline-blue-400 w-full p-2"
                                    required
                                />
                                {subjects.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSubjectField(index)}
                                        className="text-gray-500 hover:text-red-600 p-1"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addSubjectField}
                            className="text-blue-700 hover:text-blue-800 font-medium text-sm flex items-center gap-1 mt-1"
                        >
                            <Plus size={20} className='bg-blue-100 rounded-full m-1' />
                            Add More Subjects
                        </button>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsExamModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
                        >
                            Save Exam
                        </button>
                    </div>
                </form>
            </Modal>


            {/* Modal for adding a new category*/}
            <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Add New Category" maxWidth="max-w-lg">
                <form onSubmit={handleAddCategory} className='flex flex-col gap-2'>
                    <div>
                        <label htmlFor="new-category-icon" className="block mb-2 text-sm font-medium text-gray-900">Category Icon</label>
                        <input type="text" id="new-category-icon" value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block focus:outline focus:outline-blue-400 w-[98%] mx-0.5 p-2" required />
                    </div>
                    <div>
                        <label htmlFor="new-category-name" className="block mb-2 text-sm font-medium text-gray-900">Category Name</label>
                        <input type="text" id="new-category-name" value={newCategory.Name} onChange={(e) => setNewCategory({ ...newCategory, Name: e.target.value })} className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block focus:outline focus:outline-blue-400 w-[98%] mx-0.5 p-2" required />
                    </div>
                    <div>
                        <label htmlFor="new-category-description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                        <input type='text' id="new-category-description" value={newCategory.Description} onChange={(e) => setNewCategory({ ...newCategory, Description: e.target.value })} className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg block focus:outline focus:outline-blue-400 w-[98%] mx-0.5 p-2" required />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Category</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ExamManagement;