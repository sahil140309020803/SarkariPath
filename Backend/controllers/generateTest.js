import { AI } from "../GenAI/ai.js";
import { getDifficultyInstructions } from "../services/difficultyHelper.js";

export const generateQuiz = async (req, res) => {
    const { Exam, Subject, Topic, Difficulty } = req.body;
    let aiResponseText;

    if (!Subject) {
        return res.status(400).json({ success: false, message: "A 'Subject' is required to generate a quiz." });
    }

    try {
        const difficultyInstructions = getDifficultyInstructions(Difficulty || 'Medium', Exam, Subject);

        let prompt = `You are an expert multilingual question designer and a strict json parser for competitive exams. Your task is to generate a high-quality, 15-question multiple-choice quiz (MCQ).

**Exam:** ${Exam}
**Subject:** ${Subject}
**Topic:** ${Topic || 'General'}
**Difficulty Level:** ${Difficulty}

${difficultyInstructions}

**CRITICAL INSTRUCTIONS:**
1.  **Task:** Generate a targeted quiz of exactly "15" questions. The final output must be a JSON object with a single key, which is the name of the "[SUBJECT]", and its value should be an array of the 15 questions.

2.  **Bilingual Output:** Provide all text in both English ("en") and Hindi ("hi"). EXCEPTION: For the 'English' subject, the 'hi' key must be absent. For the 'Hindi' subject, the 'en' key must be absent.

3.  **Question Quality:**
    * Each question must have four plausible options.
    * Provide the correct answer key and a brief, clear HTML explanation for each question.
    * The "id" for each question must be sequential, starting from "1".

4.  **Strict JSON Format:**
    * The final output MUST be a single, valid JSON object without any surrounding text or markdown.
    * Do not include any introductory phrases, summaries, or conversational text.

**JSON FORMAT EXAMPLE:**
{
  "Reasoning": [
    {
      "id": "1",
      "en": [ "Sample question...", [["A", "Option A."]], "<div class='p-2'>Explanation</div>" ],
      "hi": [ "नमूना प्रश्न...", [["A", "विकल्प ए।"]], "<div class='p-2'>स्पष्टीकरण</div>" ],
      "correctAnswer": "A"
    }
  ]
}
        `;

        const result = await AI.generateContent(prompt, {
            responseMimeType: "application/json",
        });

        // Safety check for blocked responses
        if (!result.response.candidates || result.response.candidates.length === 0) {
            console.error("AI response blocked or empty:", JSON.stringify(result.response, null, 2));
            throw new Error("AI did not return a valid response. It may have been blocked.");
        }
        
        aiResponseText = result.response.candidates.at(0).content.parts.at(0).text;

        // Extract the JSON object from the response string
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON object found in the AI response.");
        }
        
        let cleanedJsonString = jsonMatch[0];

        // Sanitize the string to remove invalid characters
        cleanedJsonString = cleanedJsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

        const parsedData = JSON.parse(cleanedJsonString);
        
        res.json({ success: true, questions: parsedData });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message, aiRes: aiResponseText });
    }
}