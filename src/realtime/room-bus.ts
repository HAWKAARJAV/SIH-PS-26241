export type RoomEvent = {
  id: string;
  type:
    | "message.created"
    | "disha.chunk"
    | "disha.done"
    | "ledger.updated"
    | "stage.changed"
    | "presence.joined"
    | "presence.left"
    | "counsellor.joined"
    | "counsellor.left"
    | "ai.paused"
    | "ai.resumed";
  sessionId: string;
  data: Record<string, unknown>;
};

type Listener = (event: RoomEvent) => void;

const listeners = new Map<string, Set<Listener>>();
const recent = new Map<string, RoomEvent[]>();
let seq = 0;

export function publish(sessionId: string, type: RoomEvent["type"], data: Record<string, unknown> = {}): RoomEvent {
  const event: RoomEvent = { id: String(++seq), type, sessionId, data };
  const log = recent.get(sessionId) ?? [];
  log.push(event);
  recent.set(sessionId, log.slice(-80));
  for (const listener of listeners.get(sessionId) ?? []) listener(event);
  return event;
}

export function eventsSince(sessionId: string, lastId: string | null): RoomEvent[] {
  const log = recent.get(sessionId) ?? [];
  if (!lastId) return [];
  const index = log.findIndex((event) => event.id === lastId);
  if (index < 0) return log;
  return log.slice(index + 1);
}

export function subscribe(sessionId: string, listener: Listener): () => void {
  const set = listeners.get(sessionId) ?? new Set();
  set.add(listener);
  listeners.set(sessionId, set);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(sessionId);
  };
}

export function resetRoomBus() {
  listeners.clear();
  recent.clear();
  seq = 0;
}
