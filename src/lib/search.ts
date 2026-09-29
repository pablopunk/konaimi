import type { Model } from "./models";

const words = (text: string): string[] => text.toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^\p{L}\p{N}.]+/gu, " ")
  .trim().split(/\s+/).filter(Boolean);

function editDistance(left: string, right: string): number {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= right.length; j += 1) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[right.length];
}

function matchScore(query: string, candidate: string): number {
  if (query === candidate) return 0;
  if (/^\d+(?:\.\d+)*$/.test(query) && candidate === `v${query}`) return 0.5;
  if (/\d/.test(query)) return Infinity;
  if (query.length >= 2 && candidate.startsWith(query)) return 1;
  if (query.length >= 3 && candidate.includes(query)) return 2;
  const allowedEdits = query.length >= 6 ? 2 : query.length >= 4 ? 1 : 0;
  if (allowedEdits && Math.abs(query.length - candidate.length) <= allowedEdits) {
    const distance = editDistance(query, candidate);
    if (distance <= allowedEdits) return 3 + distance;
  }
  return Infinity;
}

function modelScore(model: Model, queryWords: string[]): number {
  const nameWords = words(model.name);
  const creatorWords = words(model.creator);
  const score = queryWords.reduce((total, query) => total + Math.min(
    ...nameWords.map((candidate) => matchScore(query, candidate)),
    ...creatorWords.map((candidate) => matchScore(query, candidate) + 2),
  ), 0);
  return score;
}

export function searchModels(models: Model[], query: string): Model[] {
  const queryWords = words(query);
  return models.map((model, index) => ({ model, index, score: modelScore(model, queryWords) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => {
      const first = a.model.intelligence;
      const second = b.model.intelligence;
      if (first === null && second !== null) return 1;
      if (first !== null && second === null) return -1;
      if (first !== null && second !== null && first !== second) return second - first;
      return a.score - b.score || a.index - b.index;
    })
    .map(({ model }) => model);
}
