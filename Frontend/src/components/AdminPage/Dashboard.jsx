import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Users, CheckCircle, FileText, Sparkles, Eye, Trash2, PlusCircle, Settings2 } from 'lucide-react';

const Dashboard = () => {
    const chartRef = useRef(null);
    useEffect(() => {
        const chartInstance = new Chart(chartRef.current.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['SSC CGL', 'IBPS PO', 'Railways', 'SSC CHSL', 'State PSC'],
                datasets: [{
                    label: '# of Attempts',
                    data: [1800, 1500, 1200, 900, 750],
                    backgroundColor: ['rgba(99, 102, 241, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(34, 197, 94, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                    borderRadius: 5,
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }, plugins: { legend: { display: false } } }
        });
        return () => chartInstance.destroy();
    }, []);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-xl border border-gray-200 flex items-center justify-between bg-gradient-to-br from-indigo-50 to-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"><div><p className="text-sm font-medium text-gray-500">Total Users</p><p className="text-3xl font-bold text-gray-800 mt-1">1,250</p></div><div className="bg-indigo-100 text-indigo-600 p-3 rounded-full"><Users size={24} /></div></div>
                <div className="p-6 rounded-xl border border-gray-200 flex items-center justify-between bg-gradient-to-br from-green-50 to-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"><div><p className="text-sm font-medium text-gray-500">Active Exams</p><p className="text-3xl font-bold text-gray-800 mt-1">32</p></div><div className="bg-green-100 text-green-600 p-3 rounded-full"><CheckCircle size={24} /></div></div>
                <div className="p-6 rounded-xl border border-gray-200 flex items-center justify-between bg-gradient-to-br from-blue-50 to-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"><div><p className="text-sm font-medium text-gray-500">Published Tests</p><p className="text-3xl font-bold text-gray-800 mt-1">112</p></div><div className="bg-blue-100 text-blue-600 p-3 rounded-full"><FileText size={24} /></div></div>
                <div className="p-6 rounded-xl border border-gray-200 flex items-center justify-between bg-gradient-to-br from-yellow-50 to-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"><div><p className="text-sm font-medium text-gray-500">AI Quizzes</p><p className="text-3xl font-bold text-gray-800 mt-1">45</p></div><div className="bg-yellow-100 text-yellow-600 p-3 rounded-full"><Sparkles size={24} /></div></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200"><h3 className="text-lg font-semibold text-gray-700 mb-4">Most Popular Exams</h3><div className="h-64"><canvas ref={chartRef}></canvas></div></div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200"><h3 className="text-lg font-semibold text-gray-700 mb-4">Tests Under Review</h3><div className="space-y-3"><div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"><p className="font-semibold text-gray-700">SSC CGL Full Mock #3</p><div className="flex items-center gap-3"><button className="text-gray-500 hover:text-indigo-600" title="Preview"><Eye size={20} /></button><button className="text-gray-500 hover:text-green-600" title="Publish"><CheckCircle size={20} /></button><button className="text-gray-500 hover:text-red-600" title="Discard"><Trash2 size={20} /></button></div></div></div></div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200"><h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3><div className="space-y-3"><button className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700"><PlusCircle size={20} className="mr-2" /> Add New Exam</button><button className="w-full flex items-center justify-center bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-300"><Settings2 size={20} className="mr-2" /> Generate New Test</button></div></div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200"><h3 className="text-lg font-semibold text-gray-700 mb-4">Content Pipeline</h3><ul className="space-y-4 text-sm"><li className="flex justify-between items-center"><span className="text-gray-600">Drafts</span><span className="font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">5</span></li><li className="flex justify-between items-center"><span className="text-gray-600">Pending Review</span><span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">3</span></li><li className="flex justify-between items-center"><span className="text-gray-600">Generation Errors</span><span className="font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">2</span></li></ul></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;