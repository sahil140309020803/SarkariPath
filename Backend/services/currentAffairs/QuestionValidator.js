export const validateQuestionStructure = (q) => {
  if (!q) return false;

  // Verify languages exist
  if (!q.en || !q.hi) return false;

  // English validation
  if (!q.en.Question || typeof q.en.Question !== 'string') return false;
  if (!q.en.options || !Array.isArray(q.en.options) || q.en.options.length !== 4) return false;
  if (!q.en.answer || typeof q.en.answer !== 'string') return false;
  if (!q.en.solution || typeof q.en.solution !== 'string') return false;

  // Hindi validation
  if (!q.hi.Question || typeof q.hi.Question !== 'string') return false;
  if (!q.hi.options || !Array.isArray(q.hi.options) || q.hi.options.length !== 4) return false;
  if (!q.hi.answer || typeof q.hi.answer !== 'string') return false;
  if (!q.hi.solution || typeof q.hi.solution !== 'string') return false;

  // Verify exactly one option is correct in en options
  const correctEnOptions = q.en.options.filter(o => o.isCorrect === true);
  if (correctEnOptions.length !== 1) return false;

  // Verify exactly one option is correct in hi options
  const correctHiOptions = q.hi.options.filter(o => o.isCorrect === true);
  if (correctHiOptions.length !== 1) return false;

  // Verify difficulty is valid Mongoose enum
  const validDiffs = ['Easy', 'Medium', 'Hard'];
  if (!validDiffs.includes(q.Difficulty)) {
    q.Difficulty = 'Medium'; // fallback default
  }

  // Enforce required fields
  q.Subject = 'General Awareness';
  q.Topic = 'Current Affairs';

  return true;
};

export const filterValidQuestions = (questions) => {
  if (!questions || !Array.isArray(questions)) return [];
  return questions.filter(q => {
    const isValid = validateQuestionStructure(q);
    if (!isValid) {
      console.warn("[QuestionValidator] Removing invalid question structure:", JSON.stringify(q));
    }
    return isValid;
  });
};
