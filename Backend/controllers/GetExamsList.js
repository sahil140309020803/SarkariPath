import { AI } from "../GenAI/ai.js";



export const getExamsListFromCategory = async (req, res) => {
    const { category } = req.body;
    try {
            const prompt = `You are a content generator for an educational platform. Based on the provided inputs, your job is to generate:
                1. A well-written **summary** of the topic.
                2. Concise **notes** with headings, subheadings, and bullet points where appropriate.
                3. Useful **short tricks or mnemonics** to aid in quick learning or memorization.

            All your responses must be formatted in clean, valid **HTML**, using appropriate tags such as:
            - <h1> for main title/topic
            - <h2> for sections like Summary, Notes, Short Tricks
            - <h3> for subheadings
            - <ul><li> for bullet points
            - <p> for paragraphs
            - Use <b>to highlight key points

            Here are your inputs:
            - **Topic**: Mughal Empire
            - **Language**: Hindi
            - **Exam Context**: HSSC CET Group C

            Generate all content in the given language. Ensure clarity and simplicity suitable for the exam context. Keep the tone educational and student-friendly. Avoid unnecessary explanation outside of the educational content.
            `;
            const result = await AI.generateContent(prompt);
            console.log(result)
            // res.json({success:true, message: examList});
    } catch(err) {
        res.json({success:false, message: err.message});
    }
    
}