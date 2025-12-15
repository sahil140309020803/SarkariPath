import { AI } from '../GenAI/ai.js';
import { MockTestModel, QuestionModel } from '../models/ExamModel.js';
import { examModel } from '../models/ExamModel.js';

export const setupSocketHandlers = (socket, io) => {
  socket.on('start_generation', async (data) => {
    const { 
      title, 
      examId, 
      rules,
      difficulty, 
      negativeMarks,
      duration,
      totalMarks 
    } = data;
    
    let newTest;

    const totalQuestions = rules.reduce((acc, rule) => acc + (parseInt(rule.count) || 0), 0);

    let generatedCount = 0;

    try {
      newTest = new MockTestModel({
        Title: title,
        ExamId: examId,
        Status: 'Draft',
        NegativeMarks: negativeMarks,
        Structure: rules.map(r => ({ Subject: r.name, QuestionCount: r.count })),
        Questions: [],
        TotalMarks: totalQuestions,
        DurationinMinutes: duration,
        Difficulty: difficulty
      });
      
      await newTest.save();
      console.log(`Draft test created with ID: ${newTest._id}`);

    } catch (error) {
      socket.emit('generation_error', { message: `Failed to create draft test: ${error.message}` });
      return;
    }

    let aiResponseString = ""; 
    
    try {
      for (const rule of rules) {
        for (let i = 0; i < rule.count; i++) {
          
          let questionGenerated = false;
          let retryCount = 0;
          const MAX_RETRIES = 100;

          while (!questionGenerated && retryCount < MAX_RETRIES) {
            try {
              const prompt = getSingleQuestionPrompt(examId, rule.name, difficulty);
              
              const result = await AI.generateContent(prompt);
              aiResponseString = result.response.candidates[0].content.parts[0].text;
              
              const jsonMatch = aiResponseString.match(/\{[\s\S]*\}/);
              if (!jsonMatch) {
                throw new Error("No valid JSON object found in AI response.");
              }
              const cleanedJsonString = jsonMatch[0];

              const questionData = JSON.parse(cleanedJsonString);
              
              const newQuestion = new QuestionModel({
                ...questionData,
                ExamId: examId,
                Subject: rule.name,
                Difficulty: difficulty
              });
              
              await newQuestion.validate();
              await newQuestion.save();
              
              const updatedTest = await MockTestModel.findByIdAndUpdate(
                newTest._id,
                { $push: { Questions: newQuestion._id } },
                { new: true }
              );

              if (!updatedTest) {
                throw new Error(`CRITICAL FAILURE: Could not find and update Mock Test with ID ${newTest._id}.`);
              }
              
              questionGenerated = true;
              generatedCount++;
              
              socket.emit('generation_progress', {
                count: generatedCount,
                total: totalQuestions 
              });

            } catch (error) {
              retryCount++;
              console.error(`Attempt ${retryCount}/${MAX_RETRIES} for ${rule.name} failed:`, error.message);
              if (error instanceof SyntaxError || error.message.includes("No valid JSON")) {
                console.error("Raw AI Response:", aiResponseString);
              }
            }
          }

          if (!questionGenerated) {
            throw new Error(`Failed to generate question for ${rule.name} after ${MAX_RETRIES} attempts.`);
          }
        }
      }

      const finalTest = await MockTestModel.findById(newTest._id).populate('Questions');

      if (!finalTest) {
        throw new Error(`Could not retrieve final Mock Test with ID ${newTest._id}.`);
      }

      
      // await examModel.findByIdAndUpdate(
      //   examId,
      //   { $push: { MockTests: finalTest._id } }
      // );

      
      socket.emit('generation_complete', { 
        message: 'Test generated successfully!', 
        test: finalTest 
      });

    } catch (error) {
      socket.emit('generation_error', { 
        message: 'A fatal error occurred. Test may be incomplete.',
        error: error.message
      });
    }
  });
};

function getSingleQuestionPrompt(exam, subject, difficulty) {
  const isEnglish = subject.toLowerCase() === 'english';
  const isHindi = subject.toLowerCase() === 'hindi';

  return `You are an expert multilingual question designer for competitive exams.
Your task is to generate 1 high-quality multiple-choice question (MCQ).

**Parameters:**
- Exam: "${exam}"
- Subject: "${subject}"
- Difficulty: "${difficulty}"

**CRITICAL INSTRUCTIONS:**
1.  **Bilingual Output:**
    * Provide all text in both English ("en") and Hindi ("hi").
    * **EXCEPTION:** If the subject is "English", the "hi" object MUST be null.
    * **EXCEPTION:** If the subject is "Hindi", the "en" object MUST be null.
2.  **Strict JSON Format:**
    * **CRITICAL:** The output **MUST** be ONLY the JSON object itself.
    * Do not wrap it in \`\`\`json markdown blocks.
    * Do not include *any* other text before the opening \`{\` or after the closing \`}\`.
    * The "answer" field must be the string text of the correct option, not just the letter.
    * The "solution" field must be a brief, clear explanation.

**JSON Schema to Follow:**
{
  "en": ${isHindi ? 'null' : `{
    "Question": "The question in English.",
    "options": [
      { "text": "Option A", "isCorrect": false },
      { "text": "Option B", "isCorrect": true },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ],
    "answer": "Option B",
    "solution": "Explanation in English."
  }`},
  "hi": ${isEnglish ? 'null' : `{
    "Question": "प्रश्न हिन्दी में।",
    "options": [
      { "text": "विकल्प ए", "isCorrect": false },
      { "text": "विकल्प बी", "isCorrect": true },
      { "text": "विकल्प सी", "isCorrect": false },
      { "text": "विकल्प डी", "isCorrect": false }
    ],
    "answer": "विकल्प बी",
    "solution": "स्पष्टीकरण हिन्दी में।"
  }`},
  "Topic": "A specific topic (e.g., 'Percentage', 'Ancient History')"
}
`;
}