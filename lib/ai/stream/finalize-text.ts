export function getFinalizedTextSuffix(
  accumulatedText: string,
  finalizedText: string,
) {
  if (!finalizedText || finalizedText === accumulatedText) return "";
  if (finalizedText.startsWith(accumulatedText)) {
    return finalizedText.slice(accumulatedText.length);
  }

  return "";
}
