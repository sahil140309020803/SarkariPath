export function getQuizMultipleQuestionsPrompt(examName, subjectName, topics, difficulty, history = [], count = 5) {
  const isEnglish = (subjectName || "").toLowerCase().includes('english') || (topics && topics.some(t => t.toLowerCase().includes('english')));
  const isHindi = (subjectName || "").toLowerCase().includes('hindi') || (topics && topics.some(t => t.toLowerCase().includes('hindi')));

  const recentHistory = history.slice(-40); 
  const historyList = recentHistory.length > 0
    ? `\n### 🛑 EXCLUSION LIST (DO NOT GENERATE ANYTHING SIMILAR TO THESE):\n${recentHistory.map((h, i) => `${i + 1}. [${h.topic}]: ${h.summary}...`).join('\n')}`
    : "";

  let taskText = "";
  if (topics && topics.length > 0) {
    if (topics.length === 1) {
      taskText = `Create exactly ${count} NEW, UNIQUE MCQs for the topic "${topics[0]}" within the subject "${subjectName}" (${difficulty} level) that are not present in historyList.`;
    } else {
      taskText = `Create exactly ${count} NEW, UNIQUE MCQs for the subject "${subjectName}" (${difficulty} level) distributed across these topics: ${topics.map(t => `"${t}"`).join(', ')}. Each question must belong to a different topic if possible, and not be present in historyList.`;
    }
  } else {
    taskText = `Create exactly ${count} NEW, UNIQUE MCQs for the subject "${subjectName}" (${difficulty} level) that are not present in historyList.`;
  }

  let topicMappingInstructions = "";
  if (topics && topics.length > 0) {
    topicMappingInstructions = `\n### 🎯 TOPIC MAPPING INSTRUCTIONS:
- You must generate exactly ${count} questions.
- Assign each question in the array a topic from this list: [${topics.map(t => `"${t}"`).join(', ')}].
${topics.length >= count ? `- Assign exactly ONE topic to each question (e.g. Question 1 -> "${topics[0]}", Question 2 -> "${topics[1]}", etc.) so there is no duplicate topic in this batch.` : `- Distribute the ${count} questions among the available topics: [${topics.map(t => `"${t}"`).join(', ')}].`}`;
  }

  // Determine language generation rules
  let languageInstructions = "";
  if (isHindi) {
    languageInstructions = `\n### 🌐 LANGUAGE INSTRUCTIONS:
- This is a Hindi-related subject/topic ("${subjectName}").
- BOTH the "en" and "hi" objects MUST contain the question, options, answer, and solution written in Hindi language. Do NOT translate this question into English. Copy the Hindi content as-is into BOTH fields.`;
  } else if (isEnglish) {
    languageInstructions = `\n### 🌐 LANGUAGE INSTRUCTIONS:
- This is an English-related subject/topic ("${subjectName}").
- BOTH the "en" and "hi" objects MUST contain the question, options, answer, and solution written in English language. Do NOT translate this question into Hindi. Copy the English content as-is into BOTH fields.`;
  } else {
    languageInstructions = `\n### 🌐 LANGUAGE INSTRUCTIONS:
- The "en" object must contain the question, options, answer, and solution in English.
- The "hi" object must contain the question, options, answer, and solution in Hindi.`;
  }

  return `You are a high-level question developer for the "${examName}" exam.
  Randomness Seed: ${Math.floor(Math.random() * 100000) + 1}
  Task: ${taskText}
${topicMappingInstructions}
${languageInstructions}
${historyList}

### 📝 EXPLANATION STYLE RULES (for "solution"):
- The explanation ("solution" field) must be written like a standard, professional textbook/exam answer key solution.
- Do NOT use conversational AI filler, greetings, or meta-references (e.g., do NOT start with "The correct option is...", "Here is the explanation...", "Sure, let's understand...", etc.).
- Start directly with the factual concept, formulas, historical facts, grammatical rules, or step-by-step mathematical calculations that justify the correct choice.
- Keep the language authoritative, direct, and academic.

### 🧠 REASONING & APTITUDE LOGIC RULES:
For logical reasoning and quantitative aptitude topics (such as Blood Relations, Syllogisms, Seating Arrangements, Coding-Decoding, Directions, Age problems, Mathematical puzzles, number series):
1. **Absolute Logical Correctness:** Before writing the final question and options, verify that the puzzle statement has exactly one unique mathematically correct solution.
2. **Step-by-step Planning:** You must use the "reasoning_draft" field to trace the steps (e.g. diagram coordinates, family tree mapping, seating order, or code pattern calculation). Never generate options without first solving the question step-by-step.
3. **No Contradictory Clues:** Double check that clues do not contradict each other and that all of them are necessary to solve the puzzle.

**ZERO TOLERANCE REPETITION POLICY:**
1. **NO REPEATS:** You must NOT generate any question that matches the logic, numbers, scenario, or phrasing of the questions in the EXCLUSION LIST above.  
2. **Fresh sub-topics:** Vary sub-topics and applications of concepts across the ${count} questions.
3. **Randomized Options:** Correct answer index must be varied. Position correct answers evenly among choices A, B, C, and D.
4. **JSON Format:** Return ONLY a raw JSON array containing exactly ${count} question objects. No markdown formatting around the JSON array.

**JSON Schema of the array:**
[
  {
    "reasoning_draft": "Step-by-step logic, family tree diagram, arrangement positions, Venn diagram cases, or mathematical calculations to solve the question independently before defining option blocks.",
    "en": {
      "Question": "Question text (must match the language rules specified under LANGUAGE INSTRUCTIONS)",
      "options": [
        { "text": "Choice A", "isCorrect": false },
        { "text": "Choice B", "isCorrect": false },
        { "text": "Choice C", "isCorrect": false },
        { "text": "Choice D", "isCorrect": false }
      ],
      "answer": "Exact text of the correct choice",
      "solution": "Detailed step-by-step explanation"
    },
    "hi": {
      "Question": "Question text (must match the language rules specified under LANGUAGE INSTRUCTIONS)",
      "options": [
        { "text": "विकल्प A", "isCorrect": false },
        { "text": "विकल्प B", "isCorrect": false },
        { "text": "विकल्प C", "isCorrect": false },
        { "text": "विकल्प D", "isCorrect": false }
      ],
      "answer": "सही विकल्प का सटीक टेक्स्ट",
      "solution": "विस्तृत हिन्दी व्याख्या"
    },
    "Topic": "Name of the topic this specific question belongs to (MUST match one of the assigned topics: [${topics.map(t => `"${t}"`).join(', ')}])"
  }
]
FINAL CHECK: Ensure you generate EXACTLY ${count} questions. Ensure the JSON is syntactically valid and contains no repeats.`;
}
