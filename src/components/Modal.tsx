"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-[#D5E2D9] w-full max-w-[calc(100vw-1.25rem)] sm:${maxWidth} max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[#E2E9E4] flex-shrink-0">
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#14211A] truncate pr-2">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-[#6C8176] hover:text-[#14211A] hover:bg-[#F3F7F4] transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-3.5 sm:p-5 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
