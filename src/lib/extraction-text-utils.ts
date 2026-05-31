export function compactText(value: string, maxLength = 180) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function stripLabel(value: string) {
  return value
    .replace(/^#{1,4}\s*/, "")
    .replace(/^\d+[\.\)]\s*/, "")
    .replace(/^아이디어\s*[:：]\s*/, "")
    .replace(/^["“”']|["“”']$/g, "")
    .trim();
}

export function findLabeledValue(block: string, labels: string[]) {
  const pattern = new RegExp(`(?:^|\\n)\\s*(?:${labels.join("|")})\\s*[:：]\\s*([^\\n]+)`, "i");
  const match = block.match(pattern);

  return match ? compactText(match[1]) : "";
}

export function countKeywordHits(block: string, keywords: string[]) {
  return keywords.reduce((count, keyword) => count + (block.includes(keyword) ? 1 : 0), 0);
}
