import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Clock, CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp,
  RotateCcw, BookOpen, Award, TrendingUp,
  Sparkles, AlertCircle, User, LayoutList, Trophy, Zap, Loader2, BrainCircuit
} from 'lucide-react';
import { useTestAnalysis } from '../context/TestAnalysisContext';
import { useUser } from '../context/UserContext';
import Navbar from '../components/Navbar.jsx';
import BeautifulLoadingScreen from '../components/BeautifulLoadingScreen';



const CircularProgress = ({ value, max }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="160" height="160" className="transform -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className='text-blue-600 dark:text-indigo-500 animate-circular-bar' />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{value}</span>
        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">/ {max}</span>
        <span className="text-lg font-bold text-blue-600 dark:text-indigo-400 mt-1">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subtext, icon: Icon, colorClass, bgClass }) => (
  <div className={`p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between ${bgClass} dark:bg-slate-800/50`}>
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      <Icon size={18} className={colorClass} />
    </div>
    <div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-1">{subtext}</div>
    </div>
  </div>
);

const Badge = ({ text }) => {
  const styles = {
    Easy: "bg-green-100 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-amber-900/30 dark:text-amber-400",
    Hard: "bg-red-100 text-red-700 dark:bg-rose-900/30 dark:text-rose-400"
  };
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[text] || "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300"}`}>{text}</span>;
};

const LeaderboardModal = ({ isOpen, onClose, data, isLoading, page, totalPages, onPageChange }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
              <Trophy className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Global Leaderboard</h2>
              {totalPages > 0 && <p className="text-xs text-slate-400 font-medium">Page {page} of {totalPages}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <XCircle className="text-slate-400" size={24} />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">Fetching rankings...</p>
            </div>
          ) : data.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-2 text-center w-16">Rank</th>
                  <th className="py-3 px-2">Aspirant</th>
                  <th className="py-3 px-2">Score</th>
                  <th className="py-3 px-2">Percentage</th>
                  <th className="py-3 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user, idx) => (
                  <tr key={idx} className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${user.rank <= 3 ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                    <td className="py-4 px-2">
                      <div className="flex justify-center">
                        {user.rank <= 3 ? (
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${user.rank === 1 ? 'bg-amber-400 text-white shadow-lg shadow-amber-200 dark:shadow-none' : user.rank === 2 ? 'bg-slate-300 text-white shadow-lg shadow-slate-100 dark:shadow-none' : 'bg-orange-400 text-white shadow-lg shadow-orange-100 dark:shadow-none'}`}>
                            {user.rank}
                          </span>
                        ) : (
                          <span className="w-8 h-8 flex items-center justify-center font-bold text-slate-400">#{user.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 font-semibold text-slate-700 dark:text-slate-200">{user.name}</td>
                    <td className="py-4 px-2 font-bold text-blue-600 dark:text-indigo-400">{user.score}</td>
                    <td className="py-4 px-2 text-slate-600 dark:text-slate-400 font-medium">{user.percentage}%</td>
                    <td className="py-4 px-2 text-slate-500 dark:text-slate-500 text-xs italic">
                      {user.time ? `${Math.floor(user.time / 60)}m ${user.time % 60}s` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-500">
              No participants yet. Be the first to top the charts!
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronDown size={16} className="rotate-90" /> Prev
          </button>
          <p className="text-xs text-slate-400">Updates in real-time as more aspirants submit.</p>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronDown size={16} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};








const getGrade = (accuracy) => {
  const acc = parseFloat(accuracy);
  if (acc >= 90) return { label: 'S', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', desc: 'Elite Performance' };
  if (acc >= 80) return { label: 'A', color: 'text-green-500', bg: 'bg-green-50 dark:bg-emerald-900/20', desc: 'Excellent Work' };
  if (acc >= 65) return { label: 'B', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: 'Good Progress' };
  if (acc >= 50) return { label: 'C', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', desc: 'Needs Practice' };
  return { label: 'D', color: 'text-red-500', bg: 'bg-red-50 dark:bg-rose-900/20', desc: 'Keep Trying' };
};

const ScoreOverview = ({ data }) => {
  const grade = getGrade(data.accuracy);
  const isQuiz = data.type === 'quiz';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white transition-colors">{data.title}</div>
          <span className="inline-block px-3 py-1 mt-2 rounded-full bg-blue-100 dark:bg-indigo-900/30 text-blue-700 dark:text-indigo-400 text-xs font-bold border border-blue-200 dark:border-indigo-800">
            {data.level}
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          Attempt{data.attempts > 1 ? 's' : ''} : <span className="font-semibold text-slate-800 dark:text-slate-200">{data.attempts}</span> &nbsp;|&nbsp; Last Attempt : <span className="font-semibold text-slate-800 dark:text-slate-200">{data.attemptedAt}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col md:flex-row gap-8 transition-colors">
        {/* Score Circle */}
        <div className="flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 pb-6 md:pb-0 md:pr-8">
          <h3 className="text-gray-500 dark:text-slate-400 font-medium mb-4 uppercase text-xs tracking-wider">Your Total Score</h3>
          <CircularProgress value={data.score} max={data.totalScore} />
          <div className="mt-6 text-center w-full">
            <div className="flex justify-between items-center text-sm px-8">
              <span className="text-gray-500 dark:text-slate-400">Total Accuracy</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{data.accuracy}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800/50 rounded-full h-2 mt-2 mx-auto max-w-[200px]">
              <div className={`h-2 rounded-full ${data.accuracy > 70 ? 'bg-green-500' : data.accuracy > 40 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${data.accuracy}%` }}></div>
            </div>
          </div>
        </div>

        {/* Right Metrics */}
        <div className="flex-[2] flex flex-col gap-4 justify-center">
          <div className="grid md:grid-cols-2 gap-4">
            {isQuiz ? (
              <>
                {/* Performance Grade Card */}
                <div className={`${grade.bg} p-5 rounded-2xl flex items-center gap-5 border border-blue-100/50 dark:border-blue-900/30 transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden group`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 dark:bg-black/5 rounded-bl-full -translate-y-6 translate-x-6"></div>
                  <div className={`text-5xl sm:text-6xl font-black drop-shadow-md ${grade.color} transition-transform group-hover:scale-110 duration-500`}>
                    {grade.label}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-1">
                      <Award size={14} className={grade.color} /> Grade
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                      {grade.desc}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Based on {data.accuracy}% accuracy
                    </div>
                  </div>
                </div>

                {/* Solve Pace Card */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl flex items-center gap-5 border border-indigo-100/50 dark:border-indigo-900/30 transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-bl-full -translate-y-6 translate-x-6"></div>
                  <div className="size-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:rotate-12 transition-transform duration-500">
                    <Zap size={32} fill="currentColor" className="opacity-80" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-indigo-500 dark:text-indigo-400 mb-1">
                      <Zap size={14} /> Solve Pace
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                        {data.stats.avgTimePerQuestion.toFixed(1)}
                      </span>
                      <span className="text-lg font-bold text-slate-600 dark:text-indigo-400">s</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                      avg time / question
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-900/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold mb-1">
                      <TrendingUp size={18} /> Global Rank
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {data.rank > 0 ? `#${data.rank}` : '-'}
                      <span className="text-sm font-normal text-gray-500 dark:text-slate-400"> / {data.totalAspirants}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl flex items-center justify-between border border-indigo-100 dark:border-indigo-900/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold mb-1">
                      <Award size={18} /> Percentile
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.percentile}%</div>
                  </div>
                </div>
                {data.attempts > 1 && (
                  <div className="md:col-span-2 flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl animate-in slide-in-from-top-2 duration-500">
                    <div className="bg-amber-500 text-white p-1 rounded-md shadow-sm">
                      <AlertCircle size={14} strokeWidth={3} />
                    </div>
                    <p className="text-[11px] leading-tight font-bold text-amber-800 dark:text-amber-400">
                      Rank & Percentile are locked after your 1st attempt to ensure fair global standings.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {data.isQualified ? (
            <div className="bg-green-50 dark:bg-emerald-900/10 p-4 rounded-xl flex items-center gap-3 border border-green-100 dark:border-emerald-900/30 transition-colors">
              <div className="bg-green-500 dark:bg-emerald-600 text-white p-1.5 rounded-full shadow-sm"><CheckCircle2 size={20} /></div>
              <div>
                <div className="font-bold text-green-800 dark:text-emerald-400">Qualified</div>
                <div className="text-xs text-green-700 dark:text-emerald-500">You cleared the cut-off score.</div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-rose-900/10 p-4 rounded-xl flex items-center gap-3 border border-red-100 dark:border-rose-900/30 transition-colors">
              <div className="bg-red-500 dark:bg-rose-600 text-white p-1.5 rounded-full shadow-sm"><XCircle size={20} /></div>
              <div>
                <div className="font-bold text-red-800 dark:text-rose-400">Not Qualified</div>
                <div className="text-xs text-red-700 dark:text-rose-500">You missed the cut-off score.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnalysisSection = ({ data, onGenerateAI, isGenerating, aiInsights }) => {
  const insights = aiInsights || null;
  const hasInsights = insights && (insights.strengths?.length > 0 || insights.weaknesses?.length > 0);
  const isQuiz = data.type === 'quiz';

  return (
    <div className="space-y-11">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard label="Attempted" value={data.stats.attempted} subtext={`/ ${data.stats.totalQuestions}`} icon={CheckCircle2} colorClass="text-blue-600" bgClass="bg-white" />
        <StatCard label="Correct" value={data.stats.correct} subtext="Questions" icon={CheckCircle2} colorClass="text-green-600" bgClass="bg-white" />
        <StatCard label="Incorrect" value={data.stats.incorrect} subtext="Questions" icon={XCircle} colorClass="text-red-600" bgClass="bg-white" />
        <StatCard label="Skipped" value={data.stats.skipped} subtext="Questions" icon={MinusCircle} colorClass="text-gray-500" bgClass="bg-white" />
        <StatCard label="Time" value={data.stats.timeTaken} subtext={`/ ${data.stats.totalTime}`} icon={Clock} colorClass="text-orange-600" bgClass="bg-white" />
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between mb-8 mt-12 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -translate-y-6 translate-x-6"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <Sparkles className="text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-900/50 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Insights</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personalized AI feedback based on your results</p>
            </div>
          </div>

          {!hasInsights && !isGenerating && (
            <button
              onClick={onGenerateAI}
              className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
              <BrainCircuit size={20} />
              <span>Analyze with AI</span>
            </button>
          )}

          {isGenerating && (
            <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-2xl border border-blue-200 dark:border-blue-800">
              <Loader2 size={20} className="animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}

          {hasInsights && !isGenerating && (
            <button
              onClick={onGenerateAI}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-indigo-400 font-bold hover:underline"
            >
              <RotateCcw size={14} />
              Regenerate Analysis
            </button>
          )}
        </div>

        {isGenerating ? (
          <div className="grid md:grid-cols-2 gap-6 opacity-60">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col gap-4">
                <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hasInsights ? (
          <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-green-200 dark:border-emerald-900/50 relative overflow-hidden group transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp size={100} className="text-green-500 dark:text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 mb-4 bg-green-50 dark:bg-emerald-900/20 w-fit px-3 py-1 rounded-lg border border-green-100 dark:border-emerald-800/50">
                <TrendingUp className="text-green-600 dark:text-emerald-400" size={18} />
                <h3 className="font-bold text-green-800 dark:text-emerald-300">Strengths</h3>
              </div>
              <ul className="space-y-4 relative z-10">
                {insights.strengths.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                    <CheckCircle2 className="text-green-500 dark:text-emerald-500 shrink-0" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-red-200 dark:border-rose-900/50 relative overflow-hidden group transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <AlertCircle size={100} className="text-red-500 dark:text-rose-500" />
              </div>
              <div className="flex items-center gap-2 mb-4 bg-red-50 dark:bg-rose-900/20 w-fit px-3 py-1 rounded-lg border border-red-100 dark:border-rose-800/50">
                <AlertCircle className="text-red-600 dark:text-rose-400" size={18} />
                <h3 className="font-bold text-red-800 dark:text-rose-300">Areas to Improve</h3>
              </div>
              <ul className="space-y-4 relative z-10">
                {insights.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                    <XCircle className="text-red-500 dark:text-rose-500 shrink-0" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BrainCircuit className="text-blue-400 dark:text-blue-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No Analysis Generated Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Get deep insights into your performance, identifying exactly where you shine and where to focus your efforts.</p>
            <button
              onClick={onGenerateAI}
              className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
              <BrainCircuit size={20} />
              <span>Analyze with AI</span>
            </button>
          </div>
        )}
      </div>

      {/* Subject Breakdown Table */}
      {!isQuiz && <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="text-xl font-bold text-slate-900 dark:text-white mb-6">Subject-Wise Breakdown</div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase text-gray-600 dark:text-slate-400 font-bold tracking-wider">
                <th className="py-4 pl-4 rounded-l-lg">Subject</th>
                <th className="py-4">Score</th>
                <th className="py-4 pl-6">Analysis (C/I/S)</th>
                <th className="py-4 w-1/4">Accuracy</th>
                <th className="py-4 px-20 rounded-r-lg">Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((sub, idx) => (
                <tr key={idx} className="border-b-2 border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 text-sm">
                  <td className="py-4 pl-4 font-semibold text-slate-700 dark:text-slate-300">{sub.name}</td>
                  <td className="py-4 font-bold text-blue-600 dark:text-indigo-400">
                    <span className='mr-1'>{sub.score}</span>
                    <span className="text-gray-400 dark:text-slate-500 font-semibold">
                      / {sub.total}
                    </span>
                  </td>
                  <td className="py-4 pl-6">
                    <div className="flex gap-2 text-xs font-bold text-white">
                      <span className="bg-green-500 dark:bg-emerald-600 px-2 py-1 rounded shadow-md" title="Correct">{sub.c}</span>
                      <span className="bg-red-500 dark:bg-rose-600 px-2 py-1 rounded shadow-md" title="Incorrect">{sub.i}</span>
                      <span className="bg-gray-400 dark:bg-slate-700 px-2 py-1 rounded shadow-md" title="Skipped">{sub.s}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-full flex justify-between bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${sub.accuracy > 80 ? 'bg-green-500' : sub.accuracy > 60 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${sub.accuracy}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 dark:text-slate-400">{sub.accuracy}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-20 text-gray-600 dark:text-slate-400 font-medium">{sub.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  );
};

const QuestionReview = ({ questions }) => {
  const [activeTab, setActiveTab] = useState('All Questions');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const toggleQuestion = (id) => setExpandedQuestion(expandedQuestion === id ? null : id);
  const getStatusIcon = (status) => {
    switch (status) {
      case 'correct': return <CheckCircle2 className="text-green-500" />;
      case 'incorrect': return <XCircle className="text-red-500" />;
      case 'skipped': return <MinusCircle className="text-gray-400" />;
      default: return null;
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'All Questions') return true;
    if (activeTab === 'Correct Only') return q.status === 'correct';
    if (activeTab === 'Incorrect Only') return q.status === 'incorrect';
    if (activeTab === 'Skipped Only') return q.status === 'skipped';
    return true;
  });

  return (
    <div className="space-y-6" id="detailed-analysis">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="text-2xl font-bold text-slate-900 dark:text-white">Detailed Analysis</div>
        <div className="text-sm text-gray-500 dark:text-slate-400 font-semibold">Showing {filteredQuestions.length} questions</div>
      </div>

      <div className="flex gap-4 flex-wrap pb-2">
        {['All Questions', 'Correct Only', 'Incorrect Only', 'Skipped Only'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-slate-800 dark:bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
            <div
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 gap-4 transition-all duration-300 ${expandedQuestion === q.id ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
              onClick={() => toggleQuestion(q.id)}
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0">{getStatusIcon(q.status)}</div>
                <span className="font-bold text-slate-800 dark:text-slate-100">Q.{q.id}</span>
                <Badge text={q.subject} />
                <Badge text={q.difficulty} />
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded font-semibold transition-colors"><Clock size={14} /> {q.time}</div>
                {expandedQuestion === q.id ? <ChevronUp className="text-gray-400 dark:text-slate-500" /> : <ChevronDown className="text-gray-400 dark:text-slate-500" />}
              </div>
            </div>

            {expandedQuestion === q.id && (
              <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
                <div className="mb-6">
                  <p className="text-gray-500 dark:text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Question</p>
                  <p className="text-lg text-slate-800 dark:text-slate-100 font-medium leading-relaxed font-sans">{q.question}</p>
                </div>
                <div className="mb-8 space-y-3">
                  <p className="text-gray-500 dark:text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Options</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => {
                      let optionClass = "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600";
                      let icon = <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-slate-600"></div>;

                      const isCorrect = idx === q.correctOption;
                      const isSelected = idx === q.selectedOption;

                      if (isCorrect) {
                        optionClass = "border-green-500 dark:border-emerald-500 bg-green-50 dark:bg-emerald-900/20 text-green-800 dark:text-emerald-300 font-medium ring-1 ring-green-500 dark:ring-emerald-500";
                        icon = <CheckCircle2 size={20} className="text-green-600 dark:text-emerald-500 fill-green-100 dark:fill-emerald-900/50" />;
                      } else if (isSelected && !isCorrect) {
                        optionClass = "border-red-500 dark:border-rose-500 bg-red-50 dark:bg-rose-900/20 text-red-800 dark:text-rose-300 font-medium ring-1 ring-red-500 dark:ring-rose-500";
                        icon = <XCircle size={20} className="text-red-600 dark:text-rose-500 fill-red-100 dark:fill-rose-900/50" />;
                      }

                      return (
                        <div key={idx} className={`p-4 rounded-lg border flex justify-between items-center transition-all ${optionClass}`}>
                          <span className="flex items-center gap-3"><span className="uppercase text-sm opacity-60 font-bold w-6">{String.fromCharCode(65 + idx)}.</span>{opt}</span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-indigo-900/10 rounded-xl p-6 border border-blue-100 dark:border-indigo-900/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-600 dark:bg-indigo-600 p-1 rounded"><BookOpen size={14} className="text-white" /></div>
                    <p className="text-blue-800 dark:text-indigo-300 text-sm uppercase font-bold tracking-wider">Explanation</p>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{q.solution}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};






export default function Analysis() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { analysisData, isLoading, error, fetchAnalysisData } = useTestAnalysis();
  const { backend_url } = useUser();

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(1);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const generateAIInsights = async () => {
    setIsGeneratingAI(true);
    try {
      const { data } = await axios.post(`${backend_url}/api/ai-analysis`,
        { submissionId },
        { withCredentials: true }
      );
      if (data.success) {
        setAiInsights(data.insights);
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const fetchLeaderboard = async (page = 1) => {
    if (!analysisData?.testId) return;
    if (page === 1) setIsLeaderboardOpen(true);
    setIsLeaderboardLoading(true);
    try {
      const { data } = await axios.get(
        `${backend_url}/api/test-leaderboard/${analysisData.testId}?page=${page}&limit=10`,
        { withCredentials: true }
      );
      if (data.success) {
        setLeaderboardData(data.leaderboard);
        setLeaderboardPage(data.page);
        setLeaderboardTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      fetchAnalysisData(submissionId);
    }
  }, [submissionId]);

  if (isLoading) {
    return <BeautifulLoadingScreen message="Analyzing your performance..." />;
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-100 dark:border-rose-900/30 max-w-md my-6">
          <XCircle className="w-12 h-12 text-red-500 dark:text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error Loading Analysis</h3>
          <p className="text-slate-650 dark:text-slate-400 mb-6 text-sm">{error || "Data not available"}</p>
          <button
            onClick={() => fetchAnalysisData(submissionId)}
            className="w-full bg-blue-600 dark:bg-indigo-650 text-white py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-500 transition shadow-md font-bold cursor-pointer text-sm mb-3"
          >
            Retry Loading
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm font-bold cursor-pointer text-sm"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }
  console.log(analysisData);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
        <ScoreOverview data={analysisData} />
        <AnalysisSection
          data={analysisData}
          onGenerateAI={generateAIInsights}
          isGenerating={isGeneratingAI}
          aiInsights={aiInsights}
        />
        <QuestionReview questions={analysisData?.questions} />
      </main>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 p-4 z-40 transition-all duration-300 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <div className="flex gap-2 md:gap-4 flex-1">
            <button
              onClick={() => {
                const element = document.getElementById('detailed-analysis');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 text-blue-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-indigo-900/20 transition-all border border-blue-100 dark:border-indigo-800/50"
            >
              <LayoutList size={19} />
              <span className="hidden sm:inline">Review Solutions</span>
            </button>
            {analysisData.type !== 'quiz' && (
              <button
                onClick={() => fetchLeaderboard(1)}
                className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 text-gray-600 dark:text-slate-400 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all border border-gray-200 dark:border-slate-700"
              >
                <Trophy size={19} />
                <span className="hidden sm:inline">Leaderboard</span>
              </button>
            )}
          </div>

          <div className="flex gap-2 md:gap-4">


            <button
              onClick={() => {
                if (analysisData?.testId) {
                  navigate(`/tests/${analysisData?.testId}`);
                } else {
                  console.warn("Test ID not found for retake");
                }
              }}
              className="flex items-center justify-center gap-2 px-6 md:px-8 py-2.5 bg-blue-600 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-blue-200 dark:shadow-indigo-900/40 hover:-translate-y-0.5"
            >
              <RotateCcw size={19} />
              <span>Retake Test</span>
            </button>
          </div>
        </div>
      </div>
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        data={leaderboardData}
        isLoading={isLeaderboardLoading}
        page={leaderboardPage}
        totalPages={leaderboardTotalPages}
        onPageChange={(newPage) => fetchLeaderboard(newPage)}
      />
    </div>
  );
};