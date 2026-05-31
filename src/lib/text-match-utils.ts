export function normalizeMatchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getMatchTokens(value: string) {
  return new Set(
    normalizeMatchText(value)
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  );
}

export function tokenOverlapScore(left: string, right: string) {
  const leftTokens = getMatchTokens(left);
  const rightTokens = getMatchTokens(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let overlap = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  return Math.round((overlap / Math.max(leftTokens.size, rightTokens.size)) * 100);
}
