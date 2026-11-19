"use client";

import { useEffect } from "react";

export default function Modal({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 pb-8 sm:pb-5 space-y-4 bg-nogaldark rounded-b-none sm:rounded-2xl shadow-xl shadow-black/50">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl">{titulo}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-crema/50 hover:text-crema text-3xl leading-none px-1"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
