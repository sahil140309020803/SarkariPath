export const callGeminiAPI = async (prompt) => {
    console.log("Simulating Gemini API call with prompt:", prompt);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (prompt.includes("Generate a mock test")) {
        return JSON.stringify([
            {
                subject: "General Knowledge",
                questions: [
                    { question: "What is the capital of India?", options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], answer: "B" },
                    { question: "Which river is known as the Ganges?", options: ["Yamuna", "Brahmaputra", "Ganga", "Godavari"], answer: "C" }
                ]
            },
            {
                subject: "Quantitative Aptitude",
                questions: [{ question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "B" }]
            }
        ]);
    }
    return "User engagement is strong, with a high number of published tests. Focus on converting more test-takers into registered users to maximize growth.";
};