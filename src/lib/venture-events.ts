export type VentureEventListenerEntry = readonly [eventName: string, handler: EventListener];

export function emitVentureEvent<T>(eventName: string, detail: T) {
  window.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
}

export function subscribeToVentureEvents(listeners: VentureEventListenerEntry[]) {
  listeners.forEach(([eventName, handler]) => window.addEventListener(eventName, handler));

  return () => {
    listeners.forEach(([eventName, handler]) => window.removeEventListener(eventName, handler));
  };
}
