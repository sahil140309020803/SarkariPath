import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { useExam } from '../../context/ExamContext';
import axios from 'axios';
import { toast } from "react-toastify";

const ManageCategories = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({
        icon: '',
        Name: '',
        Description: ''
    });
    const { examCatList, backend_url, setIsCatUpdated, isCatUpdated } = useExam();

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
                setIsModalOpen(false);
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manage Exam Categories</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center">
                    <Plus size={20} className="mr-2" /> Add New Category
                </button>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-xl border border-gray-300">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="font-semibold text-gray-700 uppercase bg-gray-50">
                        <tr className="divide-x divide-gray-300 border-b border-gray-300">
                            <th className="w-1/500 px-6 py-3">Icon</th>
                            <th className="w-1/8 px-6 py-3">Category Name</th>
                            <th className="w-1/2 px-6 py-3">Description</th>
                            <th className="w-1/500 px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {examCatList.map((cat, index) => (
                            <tr key={cat._id} className="bg-white divide-x divide-gray-300">
                                <td className="px-6 py-4 text-xl">{cat.icon}</td>
                                <td className="px-6 py-4 text-black font-medium">{cat.Name}</td>
                                <td className="px-6 py-4 text-black ">{cat.Description}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleDeleteCategory(cat._id)} className="text-gray-500 hover:text-red-600 inline-block cursor-pointer">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Category" maxWidth="max-w-lg">
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
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Category</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageCategories;