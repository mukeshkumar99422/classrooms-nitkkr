"use client";
import * as React from "react";

type ToastVariant = "default" | "destructive" | "success";
type Toast = { id: string; title?: string; description?: string; variant?: ToastVariant };

const listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];
let count = 0;

function dispatch(t: Toast[]) {
  toasts = t;
  listeners.forEach(l => l(toasts));
}

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = String(++count);
  dispatch([...toasts, { id, title, description, variant }]);
  setTimeout(() => dispatch(toasts.filter(t => t.id !== id)), 4000);
}

export function useToast() {
  const [state, setState] = React.useState<Toast[]>(toasts);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return { toasts: state, toast };
}
