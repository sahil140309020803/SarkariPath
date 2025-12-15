import React, { useState, useEffect } from 'react';
import { useTestWindow } from '../../context/TestWindowContext';
import { useNavigate, useParams } from 'react-router-dom';

const TestInstruction = () => {
    const [isReady, setIsReady] = useState(false);

    const { activeTest, setActiveTest, questions, setQuestions, duration, setDuration, markingScheme, setMarkingScheme, activeTestID, setActiveTestID, isTestStarted, setIsTestStarted } = useTestWindow();

    console.log(activeTest);
    const { exam_cat, exam_name, testID } = useParams();
    useEffect(() => {
        setActiveTestID(testID);
    }, []);

    const navigate = useNavigate();

    const handleStartExam = () => {
        if (isReady) {
            alert('Starting test now. Good luck!');
            setIsTestStarted(true);
            setIsReady(false);
            navigate(`/${exam_cat}/${exam_name}/tests/${testID}/live-test`);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-start p-6 bg-gray-50">
            <div className="container max-w-4xl w-full bg-white rounded-xl shadow-2xl p-8 md:p-12 my-6 transition-all duration-300">

                {/* Header */}
                <header className="text-center mb-10 pb-5 border-b-2 border-gray-200">
                    <div className="text-2xl md:text-4xl font-extrabold text-indigo-800 mb-2">EXAMINATION GUIDELINES</div>
                    <p className="inline-block bg-blue-50 text-indigo-900 border border-blue-300 rounded-lg px-4 py-2 text-sm font-semibold">
                        ⏳
                        Total Estimated Reading Time: <strong className="ml-1">3 Minutes</strong>
                    </p>
                </header>

                {/* Instructions Container */}
                <div>

                    {/* Section A: General Test Rules */}
                    <section className="mb-10">
                        <div className="text-xl md:text-2xl font-bold text-indigo-600 mb-5 border-l-4 border-indigo-600 pl-4">General Test Rules</div>
                        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className=" bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-lg shadow-md  transition duration-300">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Duration</h3>
                                <p className="text-gray-700">Total time is <strong className="text-indigo-600">{duration} minutes</strong>. The test will automatically submit when the timer expires.</p>
                            </div>
                            <div className=" bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-lg shadow-md transition duration-300">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Questions</h3>
                                <p className="text-gray-700">There are <strong className="text-indigo-600">{questions.length} Questions</strong>. You may navigate and change your answers freely before the final submission.</p>
                            </div>
                            <div className=" bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-lg shadow-md transition duration-300">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Integrity</h3>
                                <p className="text-gray-700">Do not refresh the page or use other browser tabs. This action will result in an immediate submission and may void your score.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section B: Marking Scheme & Scoring (Card Style) */}
                    <section className="mb-10">
                        <h2 className="text-xl md:text-2xl font-bold text-indigo-600 mb-5 border-l-4 border-indigo-600 pl-4">Marking Scheme & Scoring</h2>
                        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Positive Marking Card */}
                            <div className=" bg-white rounded-xl p-5 border-2 border-green-500 shadow-lg">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Correct Answer</h3>
                                <div className="text-3xl font-black text-green-500 leading-none">+{markingScheme.correct}</div>
                                <p className="text-gray-600 mt-2">You will be awarded **Three Marks** for every question answered correctly.</p>
                            </div>

                            {/* Negative Marking Card */}
                            <div className=" bg-white rounded-xl p-5 border-2 border-red-500 shadow-lg">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Incorrect Answer</h3>
                                <div className="text-3xl font-black text-red-500 leading-none">{markingScheme.incorrect !== 0 ? '-' : ''}{markingScheme.incorrect}</div>
                                <p className="text-gray-600 mt-2">{markingScheme.incorrect} Mark will be deducted for each incorrect response (Negative Marking applies).</p>
                            </div>

                            {/* Neutral Marking Card */}
                            <div className=" bg-white rounded-xl p-5 border-2 border-gray-400 shadow-lg">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Unattempted</h3>
                                <div className="text-3xl font-black text-gray-400 leading-none">0</div>
                                <p className="text-gray-600 mt-2">No marks will be deducted or awarded for questions you choose to skip.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section C: Navigation & Submission Flow */}
                    <section className="mb-10">
                        <h2 className="text-xl md:text-2xl font-bold text-indigo-600 mb-5 border-l-4 border-indigo-600 pl-4">Navigation & Submission Flow</h2>
                        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className=" bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Saving & Moving</h3>
                                <p className="text-gray-700">To confirm your response, <strong>MUST</strong> click <strong className="text-indigo-600">"Save & Next"</strong>. Your answer is NOT recorded until this step is completed.</p>
                            </div>
                            <div className=" bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Review & Flagging</h3>
                                <p className="text-gray-700">Use <strong className="text-indigo-600">"Mark for Review & Next"</strong> to flag questions. All flagged questions are <strong className="text-red-500">INCLUDED</strong> in scoring unless changed.</p>
                            </div>
                            <div className=" bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Final Submit</h3>
                                <p className="text-gray-700">Click the <strong className="text-indigo-600">"End Test"</strong> button on the question palette to manually submit your exam before the time limit expires.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section D: Question Status Palette */}
                    <section className="mb-10">
                        <h2 className="text-xl md:text-2xl font-bold text-indigo-600 mb-5 border-l-4 border-indigo-600 pl-4">Question Status Palette</h2>
                        <ul className="space-y-2">
                            <li className="text-gray-700"><strong className="text-indigo-600">Palette Location:</strong> The navigation palette is located on the right side of the main test interface.</li>
                            <li>
                                <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-md font-bold text-sm mr-2 border border-gray-300">Gray/White</span>: Question <strong className="text-indigo-600">Not Visited</strong> yet.
                            </li>
                            <li>
                                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-md font-bold text-sm mr-2">Red</span>: Question has been <strong className="text-indigo-600">Visited</strong> but <strong className="text-red-600">Not Answered</strong>.
                            </li>
                            <li>
                                <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-md font-bold text-sm mr-2">Green</span>: Question has been <strong className="text-green-700">Answered</strong> and Saved.
                            </li>
                            <li>
                                <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-md font-bold text-sm mr-2">Yellow</span>: Question is Answered and <strong className="text-yellow-700">Marked for Review</strong>.
                            </li>
                        </ul>
                    </section>
                </div>

                {/* CTA Area */}
                <footer className="text-center pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-center mb-8">
                        <input
                            type="checkbox"
                            id="declaration-check"
                            checked={isReady}
                            onChange={() => setIsReady(!isReady)}
                            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 mr-4 cursor-pointer"
                        />
                        <label htmlFor="declaration-check" className="text-lg font-medium text-gray-700 select-none">
                            I confirm that I have read and fully understood all the instructions above, and I am ready to begin the exam.
                        </label>
                    </div>
                    <button
                        id="start-exam-btn"
                        onClick={handleStartExam}
                        disabled={!isReady}
                        className={`
              px-12 py-4 text-xl font-semibold rounded-xl shadow-xl transition-all duration-300
              ${isReady
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl'
                                : 'bg-gray-500 text-white cursor-not-allowed'
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