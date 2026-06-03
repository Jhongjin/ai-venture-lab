export type MarketScanSourceQualityInput = {
  source_type: string;
  strength: string;
};

export function getMarketScanSourceQualityScore(source: MarketScanSourceQualityInput) {
  const strengthScore = source.strength === "high" ? 30 : source.strength === "medium" ? 20 : 10;
  const typeScore =
    source.source_type === "primary"
      ? 5
      : source.source_type === "news"
        ? 4
        : source.source_type === "directory"
          ? 3
          : source.source_type === "secondary"
            ? 2
            : 1;

  return strengthScore + typeScore;
}

export function sortMarketScanSourcesByQuality<TSource extends MarketScanSourceQualityInput>(
  sources: TSource[],
  limit = 5,
) {
  return [...sources]
    .sort(
      (sourceA, sourceB) =>
        getMarketScanSourceQualityScore(sourceB) - getMarketScanSourceQualityScore(sourceA),
    )
    .slice(0, limit);
}
