export function getDifficultyInstructions(difficulty, examName, subjectName) {
  const diff = (difficulty || 'Medium').trim().toLowerCase();
  const exam = (examName || '').trim().toLowerCase();
  const subject = (subjectName || '').trim().toLowerCase();

  if (diff !== 'hard') {
    return `### 📊 DIFFICULTY LEVEL: ${difficulty || 'Medium'}
- Generate questions matching the standard ${difficulty || 'Medium'} difficulty level.`;
  }

  // Guidelines specifically for HARD difficulty based on exam context
  let examGuidelines = '';

  if (exam.includes('upsc') || exam.includes('civil service') || exam.includes('ias') || exam.includes('ips') || exam.includes('ifs') || exam.includes('psc') || exam.includes('uppsc') || exam.includes('bpsc') || exam.includes('mpsc') || exam.includes('ras')) {
    examGuidelines = `
- **UPSC / State PSC Exam Standard**: UPSC demands extremely high conceptual, analytical, and statement-based questions.
- **Question Format (Statement-Based)**: At least 50% of the questions generated MUST be multi-statement evaluation questions. For example:
  "Consider the following statements regarding [Concept/Topic]:
  1. [In-depth Statement 1 containing specific, detailed provisions or facts]
  2. [In-depth Statement 2 containing specific, detailed provisions or facts]
  3. [In-depth Statement 3 containing specific, detailed provisions or facts]
  Which of the statements given above is/are correct?"
  Options MUST be structured like:
  A) 1 and 2 only / केवल 1 और 2
  B) 2 and 3 only / केवल 2 और 3
  C) 1 and 3 only / केवल 1 और 3
  D) 1, 2 and 3 / 1, 2 और 3
- **In-depth Conceptual Testing**: Do NOT ask simple factual recall questions. Focus on the core principles, constitutional provisions (specific articles, clauses, and their interpretations), economic mechanisms (e.g., monetary policy tools, inflation dynamics, trade balance), policy consequences, or cause-and-effect relationships.
- **High-Quality Distractors**: The options should be very close in meaning, using correct concepts but swapping specific details, exceptions, or timelines to require precise knowledge for elimination.`;
  } else if (exam.includes('bank') || exam.includes('sbi') || exam.includes('ibps') || exam.includes('po') || exam.includes('clerk') || exam.includes('rbi') || exam.includes('nabard')) {
    examGuidelines = `
- **Banking / PO Exam Standard**: Focuses on extreme analytical reasoning, complex calculations, and contextual English. (For Hindi subject, passage should be large based on exam context)
- **Quantitative Aptitude / Math**: Generate multi-step numerical puzzles, data sufficiency questions, or complex word problems (e.g., probability, permutations, advanced mixtures, compound interest with varying rates). The solution must require solving multiple equation steps.
- **Logical Reasoning**: Generate highly complex puzzles (e.g., blood relations with coding/symbols, multi-variable seating arrangements with 8+ persons facing different directions and having additional parameters like age or favorite color, input-output machine steps, syllogisms with "only a few" or "possibility" conditions).
- **English Language**: Focus on advanced reading comprehension inferences, double/triple fillers with sophisticated vocabulary, or complex error detection/sentence correction containing multiple subtle grammar errors.`;
  } else if (exam.includes('ssc') || exam.includes('cgl') || exam.includes('chsl') || exam.includes('cpo') || exam.includes('railway') || exam.includes('rrb') || exam.includes('ntpc')) {
    examGuidelines = `
- **SSC CGL / Railway Exam Standard**: Demands a solid grip on advanced concepts, formulas, and tricky facts.
- **Quantitative Aptitude / Math**: Generate advanced geometry, trigonometry, algebra (identities), and mensuration questions that are not direct formula applications but require geometric/algebraic tricks, auxiliary constructions, or multi-step transformations to solve.
- **General Awareness / GS**: Focus on deep, lesser-known historical details (e.g., specific treaties, administrative ranks, or terms), intricate scientific concepts (e.g., organic compounds, physics laws, or physiological processes), and constitutional amendments.
- **Reasoning**: Include challenging coding-decoding, number series with complex logic (e.g., prime number patterns, double differences), and statement-assumption/argument questions.
- **English**: Use rare idioms, phrasal verbs, active/passive or direct/indirect changes with exceptions, or spotting errors with subtle subject-verb agreement or modifier placements.`;
  } else {
    // Default Hard instructions
    examGuidelines = `
- **Analytical & Application-based Questions**: Avoid simple factual questions (e.g. "What is X?"). Instead, frame the question as a scenario, case study, or problem that requires applying a concept to solve.
- **Tricky Distractors**: Ensure that the distractors (wrong options) are highly plausible and represent common student misconceptions or common calculation errors (like sign errors, using a wrong formula step, or partial answers).
- **Concept Synthesis**: Create questions that require combining knowledge from two related sub-topics to answer correctly.`;
  }

  return `### 🛑 CRITICAL HARD DIFFICULTY INSTRUCTIONS (MUST ADHERE STRICTLY):
- **Difficulty level is HARD**: Questions must be extremely challenging, testing deep knowledge, critical thinking, or multi-step logic.
- **Question Statement Length & Detail**: Question statements MUST be significantly longer, detailed, and context-rich. Avoid short or straightforward one-sentence questions. Provide ample background context, scenario description, or detailed conditions to increase depth and testing quality.
- **Absolutely NO Simple Questions**: Do not generate any question that can be answered by basic memorization or simple definitions.
- **Advanced Explanations**: The 'solution' field MUST explicitly explain why the correct option is right, and break down why each of the incorrect choices is wrong or in what context they might have been valid.${examGuidelines}`;
}
