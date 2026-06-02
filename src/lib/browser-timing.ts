export type BrowserTimeoutId = number;
export type BrowserIntervalId = number;
export type BrowserTimerCallback = () => void;

export function scheduleBrowserTimeout(callback: BrowserTimerCallback, delayMs = 0) {
  return window.setTimeout(callback, delayMs) as BrowserTimeoutId;
}

export function clearBrowserTimeout(timeoutId: BrowserTimeoutId) {
  window.clearTimeout(timeoutId);
}

export function scheduleBrowserInterval(callback: BrowserTimerCallback, delayMs: number) {
  return window.setInterval(callback, delayMs) as BrowserIntervalId;
}

export function clearBrowserInterval(intervalId: BrowserIntervalId) {
  window.clearInterval(intervalId);
}

export function waitForBrowserDelay(delayMs: number) {
  return new Promise<void>((resolve) => {
    scheduleBrowserTimeout(resolve, delayMs);
  });
}
