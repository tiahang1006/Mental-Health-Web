export function getCosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const normA = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
  }
  