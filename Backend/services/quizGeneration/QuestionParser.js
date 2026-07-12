export function parseQuizQuestions(aiResponseString) {
  const jsonMatch = aiResponseString.match(/\[[\s\S]*\]/) || aiResponseString.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON array or object found in AI response.");

  let cleanedJsonString = jsonMatch[0]
    .replace(/\\/g, "\\\\")
    .replace(/\\\\"/g, "\\\"")
    .replace(/\\\\n/g, "\\n")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  const parsedData = JSON.parse(cleanedJsonString);
  let questionsList = [];
  if (Array.isArray(parsedData)) {
    questionsList = parsedData;
  } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
    questionsList = parsedData.questions;
  } else {
    throw new Error("AI response did not contain a list of questions.");
  }

  if (questionsList.length === 0) {
    throw new Error("AI generated 0 questions.");
  }

  return questionsList;
}
