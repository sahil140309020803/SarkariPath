import React from 'react'
import { useContext } from 'react'
// import { AppContent } from '../../context/AppContext'
import { useExam } from '../../context/ExamContext'
import { useNavigate, useParams } from 'react-router-dom';
import { useTestWindow } from '../../context/TestWindowContext';

const Section1 = () => {
  // const { showDifficulty, setShowDifficulty, difficulty, setDifficulty, setShowTestGenerate, showTestGenerate, isExamDataFetched } = useContext(AppContent);

  const { exam_cat, exam_name } = useParams();

  const {
    isExamDataFetched,
    showDifficulty, setShowDifficulty,
    difficulty, setDifficulty,
    showTestGenerate, setShowTestGenerate,
    activeExamPage
  } = useExam();

  const { activeTest, setActiveTest, questions, setQuestions, duration, setDuration, markingScheme, setMarkingScheme,} = useTestWindow();


  const navigate = useNavigate();

  const handleClick = (test) => {
    setDifficulty(null);
    setActiveTest(test);
    setQuestions(test.Questions);
    setDuration(test.DurationinMinutes);

    

    setMarkingScheme({ correct: 1, incorrect: test.NegativeMarks });
    const testId = test._id;
    navigate(`/${exam_cat}/${exam_name}/tests/${testId}`);
  }
  const removeSlug = (text) => {
    return text.replaceAll('-', ' ');
  }
  // console.log(isExamDataFetched);

  const mockTests = isExamDataFetched?.MockTests;
  console.log(mockTests);
  return (
    <div className={`w-full h-full flex justify-center items-start`}>

      <div className='w-full h-full flex flex-col justify-start items-start p-5 gap-4'>
        <div className='font-semibold text-2xl text-gray-700'>Available Mock Tests</div>
        <div className='h-full w-full mt-2 mb-2 bg-white rounded-xl p-5 shadow-2xl overflow-y-scroll flex flex-col gap-4'>
          {!isExamDataFetched && <div>Loading mock tests...</div>}
          {isExamDataFetched && mockTests.length === 0 && <div>No mock tests available for {removeSlug(activeExamPage)}.</div>}
          {isExamDataFetched && mockTests.map((test, index) => (
            <div key={index} className='bg-white p-5 rounded-xl shadow-cyan-900 shadow-xs hover:-translate-y-1 transition-all duration-500 hover:shadow w-full flex justify-between items-center cursor-pointer hover:bg-blue-50'>
              <div className='font-semibold text-lg text-gray-800 '>
                <div className='flex items-center gap-4'>
                  <span>{test.Title} </span>
                  <span className={`ml-5 font-medium text-sm rounded ${test.Difficulty === 'Easy' ? 'bg-green-50 text-green-700' : test.Difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700' : test.Difficulty === 'Hard' ? 'bg-red-50 text-red-700' : ''}`}>{test.Difficulty}</span>
                </div>
                <div className='text-sm text-gray-500'>Duration: {test.DurationinMinutes} minutes | Total Marks: {test.TotalMarks} | Total Questions: {test.Questions.length} | Negative Marking: {test.NegativeMarks}</div>
              </div>
              <div>
                <button onClick={() => handleClick(test)} className='bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-100'>Start Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Section1;