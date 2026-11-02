export function getReadingStats(content: string) {
  if (!content) {
    return { wordCount: 0, readingTime: 1 };
  }
  const clean = content.replace(/^---[\s\S]*?---/, '').trim();
  const cjk = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  const nonCjk = (clean.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || []).length;
  const wordCount = cjk + nonCjk;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));
  return {
    wordCount,
    readingTime,
  };
}
