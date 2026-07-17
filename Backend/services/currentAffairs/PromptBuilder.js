export function getPromptForCurrentAffairsChunk(chunkText) {
  return `You are an expert exam question creator for competitive government exams like UPSC, SSC CGL, Banking (IBPS, SBI PO), Railways, and State PSC.
Your task is to analyze the provided TEXT CHUNK, identify ALL important factual news, policy announcements, government schemes, summits, appointments, awards, and events, and generate a distinct, high-quality, exam-oriented Multiple Choice Question (MCQ) for EACH key factual update.

### 🛑 CRITICAL DIRECTIVE:
Do NOT skip any current affairs point, announcement, or key detail present in the text chunk. You must be extremely thorough. If the text chunk contains multiple distinct announcements or news items, generate a separate MCQ for each one. Do NOT group separate events into a single question. The number of questions you generate should match the number of key factual updates present (generate as many as necessary to cover all facts).

### 🛑 STRICT INSTRUCTIONS:
1. **Source Grounding:** Rely ONLY on the facts present in the text chunk. Do NOT invent news, events, details, dates, names, or figures that are not mentioned in the chunk.
2. **Factual Correctness:** Verify that the correct option is 100% correct according to the text, and the incorrect options are plausible but logically wrong.
3. **Banned Filler Words:** The explanation ("solution" field) must start directly with the concept, facts, or context. Do NOT use conversational AI phrases like "The correct option is...", "Here is the explanation...", etc.
4. **HTML Solution Formatting:** Use HTML tags (such as <br/>, <strong>, <b>, <ul>, <li>) to structure the solution/explanation into readable paragraphs or lists instead of a single long paragraph.
5. **Statement/Conclusion & Syllogism Layout:** If creating a statement-based question, BOTH the "en" and "hi" question text fields must use newline characters (\\n) for formatting:
   Statement:
   [Statement text]

   Conclusions / Assumptions:
   I. [Statement 1]
   II. [Statement 2]

6. **Difficulty & Question Length Guidelines**:
   - Assign "Difficulty" as "Easy", "Medium", or "Hard" depending on the complexity of the news and question.
   - For "Hard" difficulty questions, the question statement MUST be significantly longer, detailed, and context-rich. Avoid short or straightforward one-sentence questions. Provide ample background context or scenario descriptions from the text chunk.
   - For "Hard" difficulty questions, at least 50% must be statement-based (e.g., "Consider the following statements regarding X... Which of these is/are correct?"). Focus on deep policy/constitutional/economic analysis rather than simple factual extraction.

---

### TEXT CHUNK:
"""
${chunkText}
"""

---

### JSON SCHEMA:
Return ONLY a raw JSON array containing the generated question objects. Do NOT wrap the JSON inside markdown blocks (e.g. \`\`\`json).

JSON Schema:
[
  {
    "reasoning_draft": "Brief scratchpad reasoning to verify the question is factual, grammatically correct, and has a unique answer.",
    "en": {
      "Question": "Question text in English (use \\n for newlines if Statement/Conclusion type)",
      "options": [
        { "text": "Choice A", "isCorrect": false },
        { "text": "Choice B", "isCorrect": false },
        { "text": "Choice C", "isCorrect": false },
        { "text": "Choice D", "isCorrect": false }
      ],
      "answer": "Exact text of the correct choice",
      "solution": "Detailed explanation using HTML tags for paragraphs, lists, and bold headers."
    },
    "hi": {
      "Question": "सटीक हिन्दी अनुवाद (Question text in Hindi. Use \\n if Statement/Conclusion type)",
      "options": [
        { "text": "विकल्प A", "isCorrect": false },
        { "text": "विकल्प B", "isCorrect": false },
        { "text": "विकल्प C", "isCorrect": false },
        { "text": "विकल्प D", "isCorrect": false }
      ],
      "answer": "सही विकल्प का सटीक टेक्स्ट",
      "solution": "HTML टैग्स का उपयोग करके विस्तृत हिन्दी व्याख्या।"
    },
    "Subject": "General Awareness",
    "Topic": "Current Affairs",
    "Difficulty": "Medium" // Must be 'Easy', 'Medium', or 'Hard' depending on the complexity of the news
  }
]`;
}
