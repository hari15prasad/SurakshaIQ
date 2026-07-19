type SessionLifecycleHandlers = {
  onUnauthorized: () => void;
  onForbidden: () => void;
};

let handlers: SessionLifecycleHandlers | null = null;

export function registerSessionLifecycle(next: SessionLifecycleHandlers): () => void {
  handlers = next;
  return () => {
    handlers = null;
  };
}

export function handleUnauthorized(): void {
  handlers?.onUnauthorized();
}

export function handleForbidden(): void {
  handlers?.onForbidden();
}
