import { AI } from "../GenAI/ai.js";

const AITopicSummarizer = async (req, res) => {
    const { topic, language, examContext } = req.body;
    if(!topic || !language || !examContext) {
       return res.json({success: false, message: 'All Fields are necessary'});
    }
    try {
        const prompt = `You are an expert at preparing exam-oriented study content. Summarize the topic: ${topic} in the context of ${examContext} in ${language}.

        Generate a clean, visually structured HTML output using the following formatting rules:
        - Use <h2> for main sections.
        - Use <h3> for sub-sections.
        - Use <p> for paragraphs.
        - Use <ul> and <li> for listing.
        - Use <b> only for highlighting words.
        - Avoid using <h1>
        - provide proper spacing.
        - style using tailwind css.
        - it should be looking beautiful and attractive.
        - I am using your response to show it on UI using dangerouslySetInnerHTML, so make your response on the basis of it.
        - You can also show some info in tables, only if needed.
        - Give proper padding or margin, no need to show boundary of padding or margin.
        - Don't use extrabold or 2xl,3xl letters.
        - It should be responsive.
        - Output should be simple, beautiful, proper formatted, elegant, and directly usable in frontend rendering without additional styling.

        OUTPUT should have following sections:
            1. Meaning if needed.
            2. Key points if needed.
            3. Detailed notes as of Topper.
            4. Short tricks.
            5. Examples.
            6. Conclusion.

        Generate all content in the given language. Ensure clarity and simplicity suitable for the exam context. Keep the tone educational and student-friendly. Avoid unnecessary explanation outside of the educational content.
        `;
        const result = await AI.generateContent(prompt);
        res.json({success:true, message: result.response.candidates.at(0).content.parts.at(0).text});
        } catch(err) {
            res.json({success:false, message: err.message});
        }

}

export default AITopicSummarizer;