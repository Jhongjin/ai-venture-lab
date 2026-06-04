export type VentureEventListenerEntry = readonly [eventName: string, handler: EventListener];

export type WorkbenchVentureEventHandlers = {
  artifactCreated: EventListener;
  artifactUpdated: EventListener;
  experimentCreated: EventListener;
  experimentUpdated: EventListener;
  ideaCreated: EventListener;
  ideaUpdated: EventListener;
  riskCreated: EventListener;
  riskUpdated: EventListener;
  runCreated: EventListener;
  runsCreated: EventListener;
  runUpdated: EventListener;
  taskCreated: EventListener;
  tasksCreated: EventListener;
  taskUpdated: EventListener;
  telemetryCreated: EventListener;
};

export function emitVentureEvent<T>(eventName: string, detail: T) {
  window.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
}

export function buildWorkbenchVentureEventListeners({
  artifactCreated,
  artifactUpdated,
  experimentCreated,
  experimentUpdated,
  ideaCreated,
  ideaUpdated,
  riskCreated,
  riskUpdated,
  runCreated,
  runsCreated,
  runUpdated,
  taskCreated,
  tasksCreated,
  taskUpdated,
  telemetryCreated,
}: WorkbenchVentureEventHandlers): VentureEventListenerEntry[] {
  return [
    ["venture:idea-created", ideaCreated],
    ["venture:idea-updated", ideaUpdated],
    ["venture:risk-created", riskCreated],
    ["venture:risk-updated", riskUpdated],
    ["venture:experiment-created", experimentCreated],
    ["venture:experiment-updated", experimentUpdated],
    ["venture:run-created", runCreated],
    ["venture:runs-created", runsCreated],
    ["venture:run-updated", runUpdated],
    ["venture:artifact-created", artifactCreated],
    ["venture:artifact-updated", artifactUpdated],
    ["venture:task-created", taskCreated],
    ["venture:tasks-created", tasksCreated],
    ["venture:task-updated", taskUpdated],
    ["venture:telemetry-created", telemetryCreated],
  ];
}

export function subscribeToVentureEvents(listeners: VentureEventListenerEntry[]) {
  listeners.forEach(([eventName, handler]) => window.addEventListener(eventName, handler));

  return () => {
    listeners.forEach(([eventName, handler]) => window.removeEventListener(eventName, handler));
  };
}
