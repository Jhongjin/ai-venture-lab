export type BrowserLocationSnapshot = {
  hash: string;
  origin: string;
  pathname: string;
  search: string;
};

export function getBrowserLocationSnapshot(): BrowserLocationSnapshot {
  const { hash, origin, pathname, search } = window.location;

  return {
    hash,
    origin,
    pathname,
    search,
  };
}

export function replaceBrowserHistoryUrl(nextUrl: string) {
  window.history.replaceState(null, "", nextUrl);
}
