export type ExtractedIdeaRiskLevel = "낮음" | "보통" | "높음";

export function inferRiskSeverity(riskLevel: ExtractedIdeaRiskLevel) {
  if (riskLevel === "높음") {
    return "high";
  }

  if (riskLevel === "보통") {
    return "medium";
  }

  return "low";
}

export function inferRiskArea(block: string) {
  if (/요양|간병|의료|돌봄|건강/.test(block)) {
    return "규제/개인정보";
  }

  if (/금융|결제|계좌|카드|투자|보험/.test(block)) {
    return "금융/결제";
  }

  if (/대화|상담|심리|갈등|관계/.test(block)) {
    return "민감 대화/조언";
  }

  if (/로컬|공유|대여|심부름/.test(block)) {
    return "신뢰/운영";
  }

  return "제품/보안";
}
