import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp,
  Share2, RotateCcw, ArrowLeft, BookOpen, Award, TrendingUp,
  Sparkles, AlertCircle, User
} from 'lucide-react';
import { useTestAnalysis } from '../context/TestAnalysisContext';
import Navbar from '../components/Navbar.jsx';



const CircularProgress = ({ value, max }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="160" height="160" className="transform -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
        <circle cx="80" cy="80" r={radius} stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className='animate-circular-bar'/>
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-sm font-semibold text-gray-500">/ {max}</span>
        <span className="text-lg font-bold text-blue-600 mt-1">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subtext, icon: Icon, colorClass, bgClass }) => (
  <div className={`p-4 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between ${bgClass}`}>
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      <Icon size={18} className={colorClass} />
    </div>
    <div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-xs font-semibold text-gray-500 mt-1">{subtext}</div>
    </div>
  </div>
);

const Badge = ({ text }) => {
  const styles = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Hard: "bg-red-100 text-red-700"
  };
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[text] || "bg-gray-100 text-gray-700"}`}>{text}</span>;
};






const Navbar_in = () => (
  <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-5 shadow-sm">
    <div className="flex items-center gap-2">
      <BookOpen className="text-blue-600" size={24} />
      <span className="text-xl font-bold text-slate-800">SarkariPath</span>
    </div>
    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
      <a href="/dashboard" className="hover:text-blue-600 transition">Dashboard</a>
      <a href="/my-tests" className="text-blue-600 border-b-2 border-blue-600 pb-4 -mb-4">Analysis</a>
    </div>
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
      <User size={18} className="text-gray-600" />
      <span className="text-sm font-medium text-gray-700">Profile</span>
    </div>
  </nav>
);

const ScoreOverview = ({ data }) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="text-4xl font-bold text-slate-900">{data.title}</div>
        <span className="inline-block px-3 py-1 mt-2 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
          {data.level}
        </span>
      </div>
      <div className="text-sm text-gray-600 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
        Attempt{data.attempts > 1 ? 's' : ''} : <span className="font-semibold text-slate-800">{data.attempts}</span> &nbsp;|&nbsp; Last Attempt : <span className="font-semibold text-slate-800">{data.attemptedAt}</span>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row gap-8">
      {/* Score Circle */}
      <div className="flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
        <h3 className="text-gray-500 font-medium mb-4 uppercase text-xs tracking-wider">Your Total Score</h3>
        <CircularProgress value={data.score} max={data.totalScore} />
        <div className="mt-6 text-center w-full">
          <div className="flex justify-between items-center text-sm px-8">
            <span className="text-gray-500">Total Accuracy</span>
            <span className="font-bold text-slate-800">{data.accuracy}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2 mx-auto max-w-[200px]">
            <div className={`h-2 rounded-full ${data.accuracy > 70 ? 'bg-green-500' : data.accuracy > 40 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${data.accuracy}%` }}></div>
          </div>
        </div>
      </div>

      {/* Right Metrics */}
      <div className="flex-[2] flex flex-col gap-4 justify-center">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between border border-blue-100">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                <TrendingUp size={18} /> Global Rank
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {data.rank > 0 ? `#${data.rank}` : '-'}
                <span className="text-sm font-normal text-gray-500"> / {data.totalAspirants}</span>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between border border-indigo-100">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                <Award size={18} /> Percentile
              </div>
              <div className="text-2xl font-bold text-slate-800">{data.percentile}%</div>
            </div>
          </div>
        </div>

        {data.isQualified ? (
          <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 border border-green-100">
            <div className="bg-green-500 text-white p-1.5 rounded-full"><CheckCircle2 size={20} /></div>
            <div>
              <div className="font-bold text-green-800">Qualified</div>
              <div className="text-xs text-green-700">You cleared the cut-off score.</div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 border border-red-100">
            <div className="bg-red-500 text-white p-1.5 rounded-full"><XCircle size={20} /></div>
            <div>
              <div className="font-bold text-red-800">Not Qualified</div>
              <div className="text-xs text-red-700">You missed the cut-off score.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const AnalysisSection = ({ data }) => (
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
    <div className="space-y-4 ">
      <div className="flex items-center gap-3 justify-center mb-5 mt-4">
        <Sparkles className="text-blue-600 fill-blue-100" />
        <h2 className="text-2xl font-bold text-slate-900">Performance Insights</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:animate-pulse">
            <TrendingUp size={100} className="text-green-500" />
          </div>
          <div className="flex items-center gap-2 mb-4 bg-green-50 w-fit px-3 py-1 rounded-lg border border-green-100 group">
            <TrendingUp className="text-green-600" size={18}/>
            <h3 className="font-bold text-green-800">Strengths</h3>
          </div>
          <ul className="space-y-4 relative z-10">
            {data.aiInsights.strengths.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-slate-700 text-sm leading-relaxed">
                <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:animate-pulse">
            <AlertCircle size={100} className="text-red-500"/>
          </div>
          <div className="flex items-center gap-2 mb-4 bg-red-50 w-fit px-3 py-1 rounded-lg border border-red-100">
            <AlertCircle className="text-red-600" size={18} />
            <h3 className="font-bold text-red-800">Areas to Improve</h3>
          </div>
          <ul className="space-y-4 relative z-10">
            {data.aiInsights.weaknesses.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-slate-700 text-sm leading-relaxed">
                <XCircle className="text-red-500 shrink-0" size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* Subject Breakdown Table */}
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 overflow-hidden">
      <div className="text-xl font-bold text-slate-900 mb-6">Subject-Wise Breakdown</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-600 font-bold tracking-wider">
              <th className="py-4 pl-4 rounded-l-lg">Subject</th>
              <th className="py-4">Score</th>
              <th className="py-4 pl-6">Analysis (C/I/S)</th>
              <th className="py-4 w-1/4">Accuracy</th>
              <th className="py-4 px-20 rounded-r-lg">Time Spent</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((sub, idx) => (
              <tr key={idx} className="border-b-2 border-slate-50 hover:bg-slate-100 transition-all duration-300 text-sm">
                <td className="py-4 pl-4 font-semibold text-slate-700">{sub.name}</td>
                <td className="py-4 font-bold text-blue-600">
                  <span className='mr-1'>{sub.score}</span> 
                  <span className="text-gray-400 font-semibold">
                    / {sub.total}
                  </span>
                </td>
                <td className="py-4 pl-6">
                  <div className="flex gap-2 text-xs font-bold text-white">
                    <span className="bg-green-500 px-2 py-1 rounded shadow-md" title="Correct">{sub.c}</span>
                    <span className="bg-red-500 px-2 py-1 rounded shadow-md" title="Incorrect">{sub.i}</span>
                    <span className="bg-gray-400 px-2 py-1 rounded shadow-md" title="Skipped">{sub.s}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-full flex justify-between bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${sub.accuracy > 80 ? 'bg-green-500' : sub.accuracy > 60 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${sub.accuracy}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{sub.accuracy}%</span>
                  </div>
                </td>
                <td className="py-4 px-20 text-gray-600 font-medium">{sub.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-slate-900">Detailed Analysis</div>
        <div className="text-sm text-gray-500 font-semibold">Showing {filteredQuestions.length} questions</div>
      </div>

      <div className="flex gap-4 flex-wrap pb-2">
        {['All Questions', 'Correct Only', 'Incorrect Only', 'Skipped Only'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
            <div
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50 gap-4 transition-all duration-300 ${expandedQuestion === q.id ? 'bg-slate-50' : ''}`}
              onClick={() => toggleQuestion(q.id)}
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0">{getStatusIcon(q.status)}</div>
                <span className="font-bold text-slate-800">Q.{q.id}</span>
                <Badge text={q.subject} />
                <Badge text={q.difficulty} />
              </div>
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded font-semibold"><Clock size={14} /> {q.time}</div>
                {expandedQuestion === q.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </div>
            </div>

            {expandedQuestion === q.id && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="mb-6">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Question</p>
                  <p className="text-lg text-slate-800 font-medium leading-relaxed font-sans">{q.question}</p>
                </div>
                <div className="mb-8 space-y-3">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Options</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => {
                      let optionClass = "border-gray-200 bg-white text-gray-700 hover:border-gray-300";
                      let icon = <div className="w-5 h-5 rounded-full border border-gray-300"></div>;

                      const isCorrect = idx === q.correctOption;
                      const isSelected = idx === q.selectedOption;

                      if (isCorrect) {
                        optionClass = "border-green-500 bg-green-50 text-green-800 font-medium ring-1 ring-green-500";
                        icon = <CheckCircle2 size={20} className="text-green-600 fill-green-100" />;
                      } else if (isSelected && !isCorrect) {
                        optionClass = "border-red-500 bg-red-50 text-red-800 font-medium ring-1 ring-red-500";
                        icon = <XCircle size={20} className="text-red-600 fill-red-100" />;
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
                <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-600 p-1 rounded"><BookOpen size={14} className="text-white" /></div>
                    <p className="text-blue-800 text-sm uppercase font-bold tracking-wider">Explanation</p>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{q.solution}</p>
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

  useEffect(() => {
    if (submissionId) {
      fetchAnalysisData(submissionId);
    }
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error Loading Analysis</h3>
          <p className="text-slate-600 mb-6">{error || "Data not available"}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <Navbar_in />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <ScoreOverview data={analysisData} />
        <AnalysisSection data={analysisData} />
        <QuestionReview questions={analysisData?.questions} />
      </main>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 md:px-6 py-2.5 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
            <span className="hidden md:inline">Back to Dashboard</span>
          </button>
          <div className="flex gap-3 md:gap-4">
            <button className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm">
              <Share2 size={18} />
              <span className="hidden md:inline">Share Result</span>
            </button>
            <button
              onClick={() => {
                // Ensure context passes testId, or fallback gracefully
                if (analysisData?.originalTestId) {
                  navigate(`/live-test/${analysisData?.originalTestId}`);
                } else {
                  console.warn("Test ID not found for retake");
                }
              }}
              className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
              <RotateCcw size={18} />
              Retake Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}