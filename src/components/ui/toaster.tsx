"use client";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// TOASTER
export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          "rounded-lg border p-4 shadow-lg animate-fade-in",
          t.variant === "destructive" && "bg-destructive text-destructive-foreground border-destructive",
          t.variant === "success" && "bg-green-50 text-green-900 border-green-200",
          t.variant === "default" && "bg-background text-foreground",
        )}>
          {t.title && <p className="font-semibold text-sm">{t.title}</p>}
          {t.description && <p className="text-sm opacity-90 mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}