/**
 * Tiny pub/sub so data hooks can re-query when the local cache changes outside
 * of normal screen focus — specifically after a login wipes/repopulates the
 * cache for a new user, or after a background sync pulls cloud rows.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export function onDataReset(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitDataReset(): void {
  listeners.forEach((l) => l());
}
