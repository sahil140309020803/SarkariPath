export function getAdminMultipleQuestionsPrompt(examName, subjectName, topics, difficulty, history = [], count = 5) {
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

  return `You are a high-level question developer for the "${examName}" exam.
  Randomness Seed: ${Math.floor(Math.random() * 100000) + 1}
  Task: ${taskText}
${topicMappingInstructions}
${historyList}

**ZERO TOLERANCE REPETITION POLICY:**
1. **NO REPEATS:** You must NOT generate any question that matches the logic, numbers, scenario, or phrasing of the questions in the EXCLUSION LIST above.  
2. **Fresh sub-topics:** Vary sub-topics and applications of concepts across the ${count} questions.
3. **Randomized Options:** Correct answer index must be varied. Position correct answers evenly among choices A, B, C, and D.
4. **JSON Format:** Return ONLY a raw JSON array containing exactly ${count} question objects. No markdown formatting around the JSON array.

**JSON Schema of the array:**
[
  {
    "en": ${isHindi ? 'null' : `{
      "Question": "Question text in English",
      "options": [
        { "text": "Choice A", "isCorrect": false },
        { "text": "Choice B", "isCorrect": false },
        { "text": "Choice C", "isCorrect": false },
        { "text": "Choice D", "isCorrect": false }
      ],
      "answer": "Exact text of the correct choice",
      "solution": "Detailed step-by-step explanation"
    }`},
    "hi": ${isEnglish ? 'null' : `{
      "Question": "हिन्दी में प्रश्न",
      "options": [
        { "text": "विकल्प A", "isCorrect": false },
        { "text": "विकल्प B", "isCorrect": false },
        { "text": "विकल्प C", "isCorrect": false },
        { "text": "विकल्प D", "isCorrect": false }
      ],
      "answer": "सही विकल्प का सटीक टेक्स्ट",
      "solution": "विस्तृत हिन्दी व्याख्या"
    }`},
    "Topic": "Name of the topic this specific question belongs to (MUST match one of the assigned topics: [${topics.map(t => `"${t}"`).join(', ')}])"
  }
]
FINAL CHECK: Ensure you generate EXACTLY ${count} questions. Ensure the JSON is syntactically valid and contains no repeats.`;
}
