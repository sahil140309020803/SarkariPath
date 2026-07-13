import React, { useState, useEffect } from 'react';
import { useTestWindow } from '../../context/TestWindowContext';
import { useNavigate, useParams } from 'react-router-dom';

const TestInstruction = () => {
    const [isReady, setIsReady] = useState(false);

    const { activeTest, setActiveTest, questions, setQuestions, duration, setDuration, markingScheme, setMarkingScheme, activeTestID, setActiveTestID, isTestStarted, setIsTestStarted } = useTestWindow();

    console.log(activeTest);
    const { testID } = useParams();
    useEffect(() => {
        setActiveTestID(testID);
    }, [testID]);

    const navigate = useNavigate();

    const handleStartExam = () => {
        if (isReady) {
            alert('Starting test now. Good luck!');
            setIsTestStarted(true);
            setIsReady(false);
            navigate(`/tests/${testID}/live-test`, { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-start p-3 sm:p-6 bg-gray-50 dark:bg-slate-950 transition-colors">
            <div className="container max-w-4xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-4 sm:p-8 md:p-12 my-3 sm:my-6 transition-all duration-300 border border-transparent dark:border-slate-800">

                {/* Header */}
                <header className="text-center mb-6 pb-4 border-b-2 border-gray-200 dark:border-slate-800">
                    <div className="text-2xl md:text-4xl font-extrabold text-indigo-800 dark:text-indigo-400 mb-2">EXAMINATION GUIDELINES</div>
                    <p className="inline-block bg-blue-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 border border-blue-300 dark:border-indigo-800 rounded-lg px-4 py-1.5 text-xs sm:text-sm font-semibold">
                        ⏳
                        Total Estimated Reading Time: <strong className="ml-1">3 Minutes</strong>
                    </p>
                    {/* Test can not be paused/resume add this line below*/}
                    <p className='text-red-800 dark:text-rose-400 font-semibold text-xs sm:text-sm mt-2'>Note: Test can not be Paused.</p>
                </header>

                {/* Instructions Container */}
                <div className="space-y-6">

                    {/* Mobile Compact Overview (hidden on desktop) */}
                    <div className="block md:hidden bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <span className="text-slate-400 block mb-0.5">Duration</span>
                                <strong className="text-slate-800 dark:text-slate-200 text-sm">{duration} Minutes</strong>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <span className="text-slate-400 block mb-0.5">Questions</span>
                                <strong className="text-slate-800 dark:text-slate-200 text-sm">{questions.length} Items</strong>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <span className="text-slate-400 block mb-0.5">Correct Answer</span>
                                <strong className="text-green-600 dark:text-emerald-400 text-sm">+{markingScheme.correct} Marks</strong>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <span className="text-slate-400 block mb-0.5">Incorrect Answer</span>
                                <strong className="text-rose-600 dark:text-rose-400 text-sm">{markingScheme.incorrect} Marks</strong>
                            </div>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-200 dark:border-slate-800/50 pt-3">
                            <div className="flex items-start gap-2">
                                <span className="text-indigo-500 font-bold">•</span>
                                <p><strong>Save Response:</strong> Click <span className="text-indigo-600 dark:text-indigo-400 font-semibold">"Save & Next"</span> to record response.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-indigo-500 font-bold">•</span>
                                <p><strong>Mark for Review:</strong> Flagged questions are graded unless changed.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-indigo-500 font-bold">•</span>
                                <p><strong>Integrity:</strong> Test cannot be paused. Closing browser won't stop timer.</p>
                            </div>
                        </div>

                        {/* Palette Grid in Mobile */}
                        <div className="border-t border-slate-200 dark:border-slate-800/50 pt-3">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">Palette Status Guide:</span>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                                    <span className="w-16 py-0.5 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded text-center font-bold border border-gray-300 dark:border-slate-600">Unvisited</span>
                                    <span>Not Visited</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                                    <span className="w-16 py-0.5 bg-red-500 text-white rounded text-center font-bold">Unanswered</span>
                                    <span>Not Answered</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                                    <span className="w-16 py-0.5 bg-green-500 text-white rounded text-center font-bold">Answered</span>
                                    <span>Saved</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                                    <span className="w-16 py-0.5 bg-yellow-500 text-white rounded text-center font-bold">Review</span>
                                    <span>Flagged</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Detailed Sections (hidden on mobile) */}
                    <div className="hidden md:block space-y-10">

                        {/* Section A: General Test Rules */}
                        <section className="mb-10">
                            <div className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-5 border-l-4 border-indigo-600 dark:border-indigo-500 pl-4">General Test Rules</div>
                            <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className=" bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:shadow-lg shadow-md transition duration-300">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">Duration</h3>
                                    <p className="text-gray-700 dark:text-slate-300">Total time is <strong className="text-indigo-600 dark:text-indigo-400">{duration} minutes</strong>. The test will automatically submit when the timer expires.</p>
                                </div>
                                <div className=" bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:shadow-lg shadow-md transition duration-300">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">Questions</h3>
                                    <p className="text-gray-700 dark:text-slate-300">There are <strong className="text-indigo-600 dark:text-indigo-400">{questions.length} Questions</strong>. You may navigate and change your answers freely before the final submission.</p>
                                </div>
                                <div className=" bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700 hover:shadow-lg shadow-md transition duration-300">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">Integrity</h3>
                                    <p className="text-gray-700 dark:text-slate-300">Once started, this test cannot be <strong className='text-red-600 dark:text-rose-400'>paused</strong>. The timer will continue running even if you close the window or lose internet connection.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section B: Marking Scheme & Scoring */}
                        <section className="mb-10">
                            <h2 className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-5 border-l-4 border-indigo-600 dark:border-indigo-500 pl-4">Marking Scheme & Scoring</h2>
                            <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Positive Marking Card */}
                                <div className=" bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-green-500 shadow-lg">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Correct Answer</h3>
                                    <div className="text-3xl font-black text-green-500 dark:text-emerald-400 leading-none">+{markingScheme.correct}</div>
                                    <p className="text-gray-600 dark:text-slate-400 mt-2 text-sm">
                                        You will be awarded <strong className="font-semibold text-green-600 dark:text-emerald-400">{markingScheme.correct} {markingScheme.correct === 1 ? 'Mark' : 'Marks'}</strong> for every question answered correctly.
                                    </p>
                                </div>

                                {/* Negative Marking Card */}
                                <div className=" bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-red-500 shadow-lg">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Incorrect Answer</h3>
                                    <div className="text-3xl font-black text-red-500 dark:text-rose-400 leading-none">{markingScheme.incorrect}</div>
                                    <p className="text-gray-600 dark:text-slate-400 mt-2 text-sm">{markingScheme.incorrect} Mark will be deducted for each incorrect response (Negative Marking applies).</p>
                                </div>

                                {/* Neutral Marking Card */}
                                <div className=" bg-white dark:bg-slate-800 rounded-xl p-5 border-2 border-gray-400 dark:border-slate-600 shadow-lg">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Unattempted</h3>
                                    <div className="text-3xl font-black text-gray-400 dark:text-slate-500 leading-none">0</div>
                                    <p className="text-gray-600 dark:text-slate-400 mt-2 text-sm">No marks will be deducted or awarded for questions you choose to skip.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section C: Navigation & Submission Flow */}
                        <section className="mb-10">
                            <h2 className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-5 border-l-4 border-indigo-600 dark:border-indigo-500 pl-4">Navigation & Submission Flow</h2>
                            <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className=" bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">Saving & Moving</h3>
                                    <p className="text-gray-700 dark:text-slate-300 text-sm">To confirm your response, <strong>MUST</strong> click <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">"Save & Next"</strong>. Your answer is NOT recorded until this step is completed.</p>
                                </div>
                                <div className=" bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">Review & Flagging</h3>
                                    <p className="text-gray-700 dark:text-slate-300 text-sm">Use <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">"Mark for Review & Next"</strong> to flag questions. All flagged questions are <strong className="text-red-500 dark:text-rose-400">INCLUDED</strong> in scoring unless changed.</p>
                                </div>
                                <div className=" bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2">Final Submit</h3>
                                    <p className="text-gray-700 dark:text-slate-300 text-sm">Click the <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">"End Test"</strong> button on the question palette to manually submit your exam before the time limit expires.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section D: Question Status Palette */}
                        <section className="mb-10">
                            <h2 className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-5 border-l-4 border-indigo-600 dark:border-indigo-500 pl-4">Question Status Palette</h2>
                            <ul className="space-y-2">
                                <li className="text-gray-700 dark:text-slate-300 font-medium text-sm"><strong className="text-indigo-600 dark:text-indigo-400">Palette Location:</strong> The navigation palette is located on the right side of the main test interface.</li>
                                <li className="flex items-center text-gray-700 dark:text-slate-300 text-sm font-medium">
                                    <span className="inline-block bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 px-3 py-1 rounded-md font-bold text-xs mr-3 border border-gray-300 dark:border-slate-600 shadow-sm w-20 text-center">Not Visited</span>: Question <strong className="text-indigo-600 dark:text-indigo-400 ml-1">Not Visited</strong> yet.
                                </li>
                                <li className="flex items-center text-gray-700 dark:text-slate-300 text-sm font-medium">
                                    <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-md font-bold text-xs mr-3 shadow-sm w-20 text-center">Not Answered</span>: Question has been <strong className="text-indigo-600 dark:text-indigo-400 ml-1">Visited</strong> but <strong className="text-red-600 dark:text-rose-400 ml-1">Not Answered</strong>.
                                </li>
                                <li className="flex items-center text-gray-700 dark:text-slate-300 text-sm font-medium">
                                    <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-md font-bold text-xs mr-3 shadow-sm w-20 text-center">Answered</span>: Question has been <strong className="text-green-700 dark:text-emerald-400 ml-1">Answered</strong> and Saved.
                                </li>
                                <li className="flex items-center text-gray-700 dark:text-slate-300 text-sm font-medium">
                                    <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-md font-bold text-xs mr-3 shadow-sm w-20 text-center">Review</span>: Question is Answered and <strong className="text-yellow-700 dark:text-amber-400 ml-1">Marked for Review</strong>.
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                {/* CTA Area */}
                <footer className="text-center pt-6 sm:pt-8 border-t border-gray-200 dark:border-slate-800 transition-colors">
                    <div className="flex items-start sm:items-center justify-center mb-6 sm:mb-8 text-left">
                        <input
                            type="checkbox"
                            id="declaration-check"
                            checked={isReady}
                            onChange={() => setIsReady(!isReady)}
                            className="h-5 w-5 mt-0.5 sm:mt-0 text-indigo-600 dark:bg-slate-800 rounded border-gray-300 dark:border-slate-700 focus:ring-indigo-500 mr-3 cursor-pointer shrink-0"
                        />
                        <label htmlFor="declaration-check" className="text-sm sm:text-base md:text-lg font-medium text-gray-700 dark:text-slate-200 select-none cursor-pointer">
                            I confirm that I have read and fully understood all the instructions above, and I am ready to begin the exam.
                        </label>
                    </div>
                    <button
                        id="start-exam-btn"
                        onClick={handleStartExam}
                        disabled={!isReady}
                        className={`
                          w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-xl font-semibold rounded-xl shadow-xl transition-all duration-300 cursor-pointer
                          ${isReady
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl active:scale-98'
                              : 'bg-gray-500 text-white cursor-not-allowed opacity-50'
                          }
                        `}
                    >
                        I Am Ready to Begin
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TestInstruction;