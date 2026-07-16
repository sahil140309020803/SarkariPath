import React, { useState } from 'react'
import { useExam } from '../../context/ExamContext'
import { useNavigate, useParams } from 'react-router-dom';
import { useTestWindow } from '../../context/TestWindowContext';

const Section1 = () => {
  const {
    isExamDataFetched,
    setDifficulty,
    activeExamPage
  } = useExam();

  const { setActiveTest, setQuestions, setDuration, setMarkingScheme, resetTestSession } = useTestWindow();

  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const handleClick = (test) => {
    setDifficulty(null);
    // Reset all stale session state before starting a new test so that
    // flags like isTestEnded never bleed over from the previous attempt.
    resetTestSession();
    setActiveTest(test);
    setQuestions(test.Questions);
    setDuration(test.DurationinMinutes);
    setMarkingScheme({ correct: test.MarksPerQuestion !== undefined ? test.MarksPerQuestion : 1, incorrect: test.NegativeMarks });
    const testId = test._id;
    navigate(`/tests/${testId}`);
  }

  const removeSlug = (text) => {
    return text.replaceAll('-', ' ');
  }

  const getAttemptDetails = (testId) => {
    if (!isExamDataFetched?.testHistory) return null;
    return isExamDataFetched.testHistory.find(sub => sub.testId?.toString() === testId?.toString());
  };

  const mockTests = isExamDataFetched?.MockTests || [];

  const filteredMockTests = mockTests.filter(test => {
    const attempt = getAttemptDetails(test._id);
    const isAttempted = attempt !== undefined && attempt !== null;
    if (filter === 'attempted') return isAttempted;
    if (filter === 'unattempted') return !isAttempted;
    return true;
  });

  return (
    <div className="w-full h-full flex justify-center items-start">
      <div className="w-full h-full flex flex-col justify-start items-start p-0 sm:p-5 gap-4">

        {/* Title and Filter Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="font-semibold text-2xl text-gray-700 dark:text-slate-200 transition-colors">Available Mock Tests</div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Tests' },
              { id: 'attempted', label: 'Attempted' },
              { id: 'unattempted', label: 'Not Attempted' }
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilter(tag.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border cursor-pointer ${filter === tag.id
                  ? 'bg-blue-600 dark:bg-indigo-600 text-white border-blue-600 dark:border-indigo-650'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mock Tests List container with max-height and scrolling */}
        <div className="w-full max-h-[46rem] overflow-y-auto mt-2 mb-2 bg-transparent sm:bg-white sm:dark:bg-slate-900 rounded-xl p-0 sm:p-5 shadow-none border border-none sm:border-slate-100 sm:dark:border-slate-800 flex flex-col gap-4 transition-colors custom-scrollbar pr-1">
          {!isExamDataFetched && <div className="text-slate-500 dark:text-slate-400">Loading mock tests...</div>}

          {isExamDataFetched && filteredMockTests.length === 0 && (
            <div className="text-slate-500 dark:text-slate-400 italic py-6">
              No mock tests found matching this filter.
            </div>
          )}

          {isExamDataFetched && filteredMockTests.map((test, index) => {
            const attempt = getAttemptDetails(test._id);
            return (
              <div
                key={index}

                className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-slate-200 shadow-md dark:shadow-none hover:-translate-y-0.5 transition-all duration-500 hover:shadow-lg dark:hover:shadow-slate-900 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-500/30 border border-slate-200 dark:border-slate-700/50"
              >
                <div className="font-semibold text-lg text-gray-800 dark:text-slate-200 transition-colors space-y-1 w-full">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span>{test.Title} </span>
                    <span className={`font-medium text-xs rounded ${test.Difficulty === 'Easy' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : test.Difficulty === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : test.Difficulty === 'Hard' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''} transition-colors px-2 py-0.5`}>{test.Difficulty}</span>
                    {attempt && (
                      <span className="font-semibold text-[10px] rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/30">
                        Attempted
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 transition-colors leading-relaxed">
                    Duration: {test.DurationinMinutes} mins | Total Marks: {test.TotalMarks} | Questions: {test.Questions.length} | Negative Marking: {test.NegativeMarks}
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex items-center gap-3">
                  {attempt ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClick(test);
                        }}
                        className="flex-1 sm:flex-initial bg-blue-600 dark:bg-indigo-600 hover:bg-blue-700 dark:hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer text-xs tracking-wide text-center"
                      >
                        Re Attempt
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/analysis/${attempt.submissionId}`);
                        }}
                        className="flex-1 sm:flex-initial bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold px-4 py-2.5 rounded-xl transition-all shadow-md border border-slate-200 dark:border-slate-600 active:scale-98 cursor-pointer text-xs tracking-wide text-center"
                      >
                        Analysis
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(test);
                      }}
                      className="w-full sm:w-auto bg-blue-600 dark:bg-indigo-600 hover:bg-blue-700 dark:hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer text-sm tracking-wide text-center"
                    >
                      Start Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default Section1;