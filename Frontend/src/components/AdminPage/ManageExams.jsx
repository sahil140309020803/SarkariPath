import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ManageExams = () => {
    const [exams, setExams] = useState([
        { name: 'SSC CGL Tier-1', category: 'SSC', tests: 12, status: 'Active' },
        { name: 'IBPS PO Prelims', category: 'Banking', tests: 8, status: 'Active' },
        { name: 'SSC CHSL', category: 'SSC', tests: 5, status: 'Active' },
    ]);
    const examsByCategory = exams.reduce((acc, exam) => { (acc[exam.category] = acc[exam.category] || []).push(exam); return acc; }, {});

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manage Exams</h2>
                <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center">
                    <Plus size={20} className="mr-2" /> Add New Exam
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.keys(examsByCategory).map(category => (
                    <div key={category} className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out hover:-translate-y-1 max-h-[30rem] overflow-y-auto">
                        <div className="text-2xl font-semibold text-gray-800 mb-4">{category}</div>
                        <div className="space-y-1">
                            {examsByCategory[category].map(exam => (
                                <div key={exam.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                                    <div>
                                        <p className="font-semibold text-gray-900">{exam.name}</p>
                                        <p className="text-xs text-gray-500">{exam.tests} Published Tests</p>
                                    </div>
                                    <div className='flex items-center gap-5'>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 mt-0.5 rounded-full ${exam.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {exam.status}
                                        </span>
                                        <Trash2 size={18} className='text-red-600 hover:text-red-800' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageExams;