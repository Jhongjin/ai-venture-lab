export function emitVentureEvent<T>(eventName: string, detail: T) {
  window.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
}
