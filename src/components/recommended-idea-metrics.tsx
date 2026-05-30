type RecommendedIdeaMetricsProps = {
  buildDeliveryLabel: string;
  productSurfaceShortLabel: string;
  readinessScore: number;
  strategyScore: number;
  validationScore: number;
};

export function RecommendedIdeaMetrics({
  buildDeliveryLabel,
  productSurfaceShortLabel,
  readinessScore,
  strategyScore,
  validationScore,
}: RecommendedIdeaMetricsProps) {
  return (
    <div data-smoke="recommended-idea-metrics" className="mt-4 flex flex-wrap gap-2">
      <span className="avl-pill avl-pill-neutral">검증 {validationScore}/100</span>
      <span className="avl-pill avl-pill-neutral">사업/제작 {strategyScore}%</span>
      <span className="avl-pill avl-pill-neutral">준비 {readinessScore}%</span>
      <span className="avl-pill avl-pill-brand">형태 {productSurfaceShortLabel}</span>
      <span className="avl-pill avl-pill-info">개발 방식 {buildDeliveryLabel}</span>
    </div>
  );
}
