import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  CircleDollarSign, FileText, TrendingUp, Files, Settings,
  LogOut, Sparkles, Lock
} from "lucide-react";

const NAV_ITEMS = [
  { section: "Principal" },
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/app" },
  { id: "clients", icon: Users, label: "Clients", href: "/app/clients" },
  { id: "projects", icon: FolderKanban, label: "Projets", href: "/app/projects" },
  { id: "tasks", icon: CheckSquare, label: "Tâches", href: "/app/tasks" },
  { section: "Finance" },
  { id: "finances", icon: CircleDollarSign, label: "Finances", href: "/app/finances" },
  { id: "invoices", icon: FileText, label: "Factures", href: "/app/invoices" },
  { section: "Analyse" },
  { id: "analytics", icon: TrendingUp, label: "Analytics", href: "/app/analytics" },
  { id: "ai", icon: Sparkles, label: "Assistant IA", href: "/app/ai", proOnly: true },
  { section: "Compte" },
  { id: "docs", icon: Files, label: "Documents", href: "#" },
  { id: "settings", icon: Settings, label: "Paramètres", href: "#" },
];

const PLAN_LABELS: Record<string, string> = {
  free: "Plan Free",
  pro: "Plan Pro",
  business: "Plan Business",
};

const PLAN_COLORS: Record<string, string> = {
  free: "text-muted-foreground",
  pro: "text-primary",
  business: "text-amber-400",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { displayName, initials, plan, signOut } = useAuth();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-sidebar border-r border-border flex flex-col flex-shrink-0">
        <div className="p-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg hover:opacity-80 transition-opacity">
            <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(124,58,237,0.8)]"></span>
            Cockpit
          </Link>
          <Link href="/" className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
            ← Accueil
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item, idx) => {
            if (item.section) {
              return (
                <div key={`sec-${idx}`} className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-dim">
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = location === item.href || (item.href !== "/app" && location.startsWith(item.href!));
            const isLocked = item.proOnly && plan === "free";

            return (
              <Link key={item.id} href={item.href!} className="block">
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                  isLocked
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : isActive
                      ? "bg-primary-glow text-[#C4B5FD] font-medium relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-5 after:bg-primary after:rounded-r-full"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}>
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {isLocked && <Lock className="w-3 h-3 opacity-50" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold truncate">{displayName}</div>
              <div className={cn("text-[11px] truncate font-medium", PLAN_COLORS[plan])}>
                ✦ {PLAN_LABELS[plan]}
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-white/5"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string, subtitle?: string, children?: React.ReactNode }) {
  return (
    <header className="px-8 py-6 flex items-center justify-between border-b border-border/50 shrink-0 relative z-10 backdrop-blur-sm bg-background/80">
      <div>
        <h1 className="text-2xl font-bold font-display">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </header>
  );
}
