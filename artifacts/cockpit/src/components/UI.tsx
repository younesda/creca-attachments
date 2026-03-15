import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Button({ className, variant = "primary", size = "md", children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost", size?: "sm" | "md" | "lg" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]": variant === "primary",
          "border border-border bg-transparent text-foreground hover:bg-white/5": variant === "outline",
          "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5": variant === "ghost",
          "px-3 py-1.5 text-xs": size === "sm",
          "px-4 py-2 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ className, variant = "primary", children }: { className?: string, variant?: "primary" | "success" | "warning" | "danger" | "info" | "muted", children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap",
        {
          "bg-primary/20 text-primary": variant === "primary",
          "bg-success-bg text-success": variant === "success",
          "bg-warning-bg text-warning": variant === "warning",
          "bg-danger-bg text-danger": variant === "danger",
          "bg-info-bg text-info": variant === "info",
          "bg-muted text-muted-foreground": variant === "muted",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-card border border-border rounded-xl transition-colors duration-300", className)} {...props}>
      {children}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, children }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider", className)}>
      {children}
    </label>
  );
}

export function Progress({ value, color = "var(--color-primary)" }: { value: number, color?: string }) {
  return (
    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold font-display">{title}</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
