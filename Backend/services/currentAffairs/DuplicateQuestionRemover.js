export const removeDuplicateQuestions = (questions) => {
  if (!questions || !Array.isArray(questions)) return [];

  const seen = new Set();
  const unique = [];

  for (const q of questions) {
    if (!q || (!q.en && !q.hi)) continue;

    // Use English question or Hindi question as normalization key
    const textToCompare = (q.en?.Question || q.hi?.Question || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") // remove non-alphanumeric chars
      .trim();

    if (!seen.has(textToCompare)) {
      seen.add(textToCompare);
      unique.push(q);
    } else {
      console.log(`[DuplicateQuestionRemover] Removing duplicate question: "${q.en?.Question || q.hi?.Question}"`);
    }
  }

  return unique;
};
