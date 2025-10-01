import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Analytics = () => {
    const engagementRef = useRef(null);
    const funnelRef = useRef(null);
    const popularityRef = useRef(null);

    useEffect(() => {
        const charts = [];
        if (engagementRef.current) {
            charts.push(new Chart(engagementRef.current.getContext('2d'), { type: 'line', data: { labels: Array.from({ length: 30 }, (_, i) => i + 1), datasets: [{ label: 'Active Users', data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 500) + 200), borderColor: 'rgba(99, 102, 241, 1)', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } } }));
        }
        if (funnelRef.current) {
            charts.push(new Chart(funnelRef.current.getContext('2d'), { type: 'bar', data: { labels: ['Tests Started', 'Tests Completed'], datasets: [{ label: 'Count', data: [5230, 4602], backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(34, 197, 94, 0.7)'], borderRadius: 5, }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }, plugins: { legend: { display: false } } } }));
        }
        if (popularityRef.current) {
            charts.push(new Chart(popularityRef.current.getContext('2d'), { type: 'doughnut', data: { labels: ['SSC', 'Banking', 'Railways', 'Other'], datasets: [{ data: [45, 25, 15, 15], backgroundColor: ['#6366F1', '#22C55E', '#3B82F6', '#F59E0B'], }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } } }));
        }
        return () => charts.forEach(chart => chart.destroy());
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="p-6 rounded-xl border border-gray-200 bg-white"><p className="text-sm font-medium text-gray-500">Average Score</p><p className="text-3xl font-bold text-indigo-600 mt-1">72%</p></div>
                <div className="p-6 rounded-xl border border-gray-200 bg-white"><p className="text-sm font-medium text-gray-500">Avg. Time per Test</p><p className="text-3xl font-bold text-indigo-600 mt-1">24m 15s</p></div>
                <div className="p-6 rounded-xl border border-gray-200 bg-white"><p className="text-sm font-medium text-gray-500">Test Completion Rate</p><p className="text-3xl font-bold text-indigo-600 mt-1">88%</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200"><h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Active Users (Last 30 Days)</h3><div className="h-80"><canvas ref={engagementRef}></canvas></div></div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200"><h3 className="text-lg font-semibold text-gray-700 mb-4">Test Performance Funnel</h3><div className="h-40"><canvas ref={funnelRef}></canvas></div></div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200"><h3 className="text-lg font-semibold text-gray-700 mb-4">Category Popularity</h3><div className="h-40"><canvas ref={popularityRef}></canvas></div></div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;