export type Listener<E> = (event: E) => void;

export interface Emitter<M extends Record<string, unknown>> {
  on<K extends keyof M>(type: K, listener: Listener<M[K]>): () => void;
  emit<K extends keyof M>(type: K, event: M[K]): void;
}

export function createEmitter<M extends Record<string, unknown>>(): Emitter<M> {
  const listeners = new Map<keyof M, Set<Listener<never>>>();
  return {
    on(type, listener) {
      let set = listeners.get(type);
      if (!set) listeners.set(type, (set = new Set()));
      set.add(listener as Listener<never>);
      return () => {
        set.delete(listener as Listener<never>);
      };
    },
    emit(type, event) {
      for (const l of [...(listeners.get(type) ?? [])]) (l as Listener<typeof event>)(event);
    },
  };
}
