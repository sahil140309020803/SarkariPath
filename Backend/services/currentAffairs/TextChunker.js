export const splitTextIntoChunks = (text, maxChunkSize = 4000) => {
  if (!text) return [];
  const chunks = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    let endIndex = currentIndex + maxChunkSize;
    if (endIndex >= text.length) {
      chunks.push(text.substring(currentIndex).trim());
      break;
    }

    // Try to find a logical boundary (a double newline or single newline)
    let boundary = text.lastIndexOf('\n\n', endIndex);
    if (boundary <= currentIndex || boundary > endIndex + 500) {
      boundary = text.lastIndexOf('\n', endIndex);
    }
    if (boundary <= currentIndex || boundary > endIndex + 500) {
      boundary = text.lastIndexOf('. ', endIndex);
    }

    if (boundary > currentIndex) {
      // Move boundary to skip the boundary character(s)
      chunks.push(text.substring(currentIndex, boundary).trim());
      currentIndex = boundary;
    } else {
      // Force split
      chunks.push(text.substring(currentIndex, endIndex).trim());
      currentIndex = endIndex;
    }
  }

  return chunks.filter(c => c.length > 0);
};
