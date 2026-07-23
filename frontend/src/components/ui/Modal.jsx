import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import Button from "./Button.jsx";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md", // sm, md, lg
  footerActions,
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div
        className={`w-full ${sizes[size]} glass-card-static p-6 shadow-glow relative animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-glass-border mb-4">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <Button variant="ghost" onClick={onClose} className="p-1.5 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="text-sm text-text-primary/90 mb-6 max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-glass-border">
            {footerActions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
