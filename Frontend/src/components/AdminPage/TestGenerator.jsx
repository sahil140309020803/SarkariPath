import React, { useState } from 'react';
import { Plus, Sparkles, Eye, CheckCircle, Trash2 } from 'lucide-react';
import { callGeminiAPI } from '../../api/gemini';
import Modal from './Modal';

const TestGenerator = () => {
    const [subjects, setSubjects] = useState([{ name: '', count: 5 }]);
    const [recentGenerations, setRecentGenerations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previewTest, setPreviewTest] = useState(null);

    const handleAddSubject = () => setSubjects([...subjects, { name: '', count: 5 }]);
    const handleRemoveSubject = (index) => setSubjects(subjects.filter((_, i) => i !== index));
    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    const totalQuestions = subjects.reduce((sum, s) => sum + (parseInt(s.count) || 0), 0);

    const handleGenerate = async () => {
        setIsLoading(true);
        const testTitle = document.getElementById('test-title').value || "Untitled Test";
        const subjectPrompts = subjects.filter(s => s.name && s.count > 0).map(s => `${s.count} questions on ${s.name}`).join(', ');
        const prompt = `Generate a mock test for the SSC CGL Tier-1 exam. Create ${subjectPrompts}. The questions should be multiple-choice with 4 options (A, B, C, D) and a clear correct answer. Provide the output as a clean, stringified JSON array where each element is an object with "subject" and "questions" keys. The "questions" key should hold an array of objects, each with "question", "options" (an array of 4 strings), and "answer" (the correct option letter). Do not include any text outside of the JSON array.`;

        const rawResponse = await callGeminiAPI(prompt);
        try {
            const jsonString = rawResponse.replace(/```json|```/g, '').trim();
            const generatedTest = JSON.parse(jsonString);
            setRecentGenerations([{ title: testTitle, date: new Date(), content: generatedTest }, ...recentGenerations].slice(0, 5));
        } catch (e) {
            alert("Failed to parse AI response.");
        }
        setIsLoading(false);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Test Generator</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-900">Test Title</label><input type="text" id="test-title" className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" placeholder="e.g., Full Mock Test #5" /></div>
                    </div>
                    <hr />
                    <div>
                        <div id="subject-list" className="space-y-4">
                            {subjects.map((s, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div className="md:col-span-3"><label className="block mb-1 text-xs font-medium text-gray-700">Subject Name</label><input type="text" value={s.name} onChange={e => handleSubjectChange(i, 'name', e.target.value)} className="subject-name bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="e.g., General Knowledge" /></div>
                                    <div className="md:col-span-1"><label className="block mb-1 text-xs font-medium text-gray-700"># Questions</label><input type="number" value={s.count} onChange={e => handleSubjectChange(i, 'count', e.target.value)} className="num-questions bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" /></div>
                                    <button onClick={() => handleRemoveSubject(i)} className="text-red-500 hover:text-red-700 p-2.5 bg-gray-100 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddSubject} className="mt-4 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 flex items-center text-sm"><Plus size={16} className="mr-2" /> Add Subject</button>
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm flex justify-between items-center">
                            <div><span className="font-semibold text-indigo-800">Total Subjects:</span><span className="font-bold text-indigo-900 ml-2">{subjects.length}</span></div>
                            <div><span className="font-semibold text-indigo-800">Total Questions:</span><span className="font-bold text-indigo-900 ml-2">{totalQuestions}</span></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700">AI Generation</h3>
                    <p className="text-sm text-gray-500 mt-1">Click the button to start the AI-powered test creation process.</p>
                    <button onClick={handleGenerate} disabled={isLoading} className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 flex items-center justify-center disabled:bg-indigo-400">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <Sparkles size={20} className="mr-2" />}
                        {isLoading ? 'Generating...' : 'Generate with AI'}
                    </button>
                    <div className="mt-8"><h3 className="text-xl font-semibold text-gray-700">Recent Generations</h3>
                        <div className="space-y-3 mt-4">
                            {recentGenerations.length > 0 ? recentGenerations.map((gen, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                                    <div><p className="font-semibold text-gray-900">{gen.title}</p><p className="text-xs text-gray-500">Generated on: {gen.date.toLocaleTimeString()}</p></div>
                                    <div className="flex items-center gap-3"><button onClick={() => setPreviewTest(gen)} className="text-gray-500 hover:text-indigo-600" title="Preview"><Eye size={20} /></button><button className="text-gray-500 hover:text-green-600" title="Publish"><CheckCircle size={20} /></button><button className="text-gray-500 hover:text-red-600" title="Discard"><Trash2 size={20} /></button></div>
                                </div>
                            )) : <p className="text-sm text-gray-500">No tests generated yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={!!previewTest} onClose={() => setPreviewTest(null)} title={previewTest?.title}>
                <div className="prose prose-sm max-w-none">{previewTest?.content.map(subjectData => (<div key={subjectData.subject}><h3>{subjectData.subject}</h3><ol className="list-decimal pl-5 space-y-4">{subjectData.questions.map((q, i) => (<li key={i}><p className="font-semibold">{q.question}</p><ul className="list-disc pl-5 mt-2 space-y-1">{q.options.map((opt, oi) => (<li key={oi}>{opt}</li>))}</ul><p className="mt-1 text-sm"><strong>Answer:</strong> {q.answer}</p></li>))}</ol></div>))}</div>
            </Modal>
        </div>
    );
};

export default TestGenerator;