import { AI } from "../GenAI/ai.js";
import fs from 'fs';
import { getDifficultyInstructions } from "../services/difficultyHelper.js";

export const generateMockTest = async (req, res) => {
    const { Exam, SubjectPrompt, Difficulty } = req.body;
    let aiResponseText;
    try {
        const difficultyInstructions = getDifficultyInstructions(Difficulty || 'Medium', Exam, '');

        let prompt = `You are an expert multilingual question designer and also act as json parser for competitive exams. Your task is to generate a set of high-quality multiple-choice questions (MCQs) based on the parameters provided.

**Exam:** ${Exam}
**Difficulty Level:** ${Difficulty || 'Medium'}

${difficultyInstructions}

**CRITICAL INSTRUCTIONS:**
1.  **Subject Prompt**: 
      ${SubjectPrompt}

2.  **Bilingual Output:** VERY CRITICAL POINT
    * Provide all text content in both English ("en") and Hindi ("hi") except Subject's 'English' and 'Hindi'. In these subjects only one language must be there and other field is absent.EX. For Subject 'English' hi must be absent and for 'Hindi' en must be absent.

3.  **Question Quality:**
    * Each question must have four plausible options.
    * Provide the correct answer key and a brief, clear explanation for each question.
    * The "id" for each question must be globally unique and sequential for the entire test, starting from "1". For a full mock test, numbering **MUST** continue across different subjects.


4.  **Strict JSON Format:**
    * The final output **MUST** be a single, valid **JSON array of objects** without any surrounding text or markdown.
    * Ensure all string values are properly JSON escaped (e.g., newlines must be represented as \\n).

5.  **HTML Explanation:**
    * The explanation (the third element in the language arrays) **MUST** be a string containing simple HTML styled with Tailwind CSS classes.
6. VERY VERY IMPORTANT OR CRITICAL POINT:
      Take your time to generate your response but make sure that there will be no errors like string literal, control statement, forgot comma, forgot ']', Unexpected non-whitespace character after JSON etc. These are the errors that I got during json parse. So, please generate your response carefully.
      -> generate the response carefully so that json.parse() can easily parse it without any error.
      -> No extra text should be there .
      -> Do not include any introductory phrases, summaries, conversational text.
***VERY VERY VERY VERY CRITICAL POINT, NEVER SKIP THIS***Do not include any introductory phrases, summaries, conversational text before and after json object.******
*** This test must not contains any incorrect option and I don't want any extra text inside Explanation. No extra talks about AI because you are a question designer. Do not give any extra text outside the json.


**JSON FORMAT EXAMPLES:**

**Example 1: For a targeted quiz where Subject is "Reasoning"**
{
  "Reasoning": [
    {
      "id": "1",
      "en": [ "Sample question...", [["A", "Option A."]], "<div...>" ],
      "hi": [ "नमूना प्रश्न...", [["A", "विकल्प ए।"]], "<div...>" ],
      "correctAnswer": "A"
    }
  ]
}

**Example 2: For a full mock test for the specfice Exam
{
  "General Awareness": [
    {
      "id": "1",
      "en": [
        "Who was the first Chief Minister of Haryana?",
        [
          ["A", "Bansi Lal"],
          ["B", "Bhagwat Dayal Sharma"],
          ["C", "Devi Lal"],
          ["D", "Rao Birender Singh"]
        ],
        "<div class='...'>Explanation for the question.</div>"
      ],
      "hi": [
        "हरियाणा के पहले मुख्यमंत्री कौन थे?",
        [
          ["A", "बंसी लाल"],
          ["B", "भगवत दयाल शर्मा"],
          ["C", "देवी लाल"],
          ["D", "राव बीरेंद्र सिंह"]
        ],
        "<div class='...'>प्रश्न का स्पष्टीकरण।</div>"
      ],
      "correctAnswer": "B"
    },
    {
      "id": "2",
      "en": ["...", [["A", "..."]], "..."],
      "hi": ["...", [["A", "..."]], "..."],
      "correctAnswer": "C"
    }
  ],
  "Reasoning": [
    {
      "id": "3",
      "en": [
        "If 'CAT' is coded as 24 and 'DOG' is coded as 26, how will 'TIGER' be coded?",
        [
          ["A", "60"],
          ["B", "59"],
          ["C", "61"],
          ["D", "58"]
        ],
        "<div class='...'>Explanation for the question.</div>"
      ],
      "hi": [
        "यदि 'CAT' को 24 और 'DOG' को 26 के रूप में कोडित किया जाता है, तो 'TIGER' को कैसे कोडित किया जाएगा?",
        [
          ["A", "60"],
          ["B", "59"],
          ["C", "61"],
          ["D", "58"]
        ],
        "<div class='...'>प्रश्न का स्पष्टीकरण।</div>"
      ],
      "correctAnswer": "B"
    }
  ],
  "English Language": [
    {
      "id": "4",
      "en": [
        "Choose the word that is the antonym of 'VIRTUE'.",
        [
          ["A", "Goodness"],
          ["B", "Vice"],
          ["C", "Honesty"],
          ["D", "Merit"]
        ],
        "<div class='...'>Explanation for the question.</div>"
      ],
      "correctAnswer": "B"
    }
  ]
}
        `;

        const result = await AI.generateContent(prompt, {
        responseMimeType: "application/json",
    });
        aiResponseText = result.response.candidates.at(0).content.parts.at(0).text;

        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON array found in the AI response.");
        }
        
        let cleanedJsonString = jsonMatch[0];

        cleanedJsonString = cleanedJsonString.replace(/,(\s*,)+/g, ',');
        cleanedJsonString = cleanedJsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

        const parsedData = JSON.parse(cleanedJsonString);
        // console.log(aiResponseText);
        res.json({ success: true, questions: parsedData });

    } catch (err) {
        // console.error("AI Response Text was:", aiResponseText);
        res.status(500).json({ success: false, message: err.message, aiRes: aiResponseText });
    }
}