export function toDownloadFileName(value: string, suffix: string, extension = "md") {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "venture-lab"}-${suffix}.${extension}`;
}
