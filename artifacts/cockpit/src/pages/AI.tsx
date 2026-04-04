import React, { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/Layout";
import { PlanGate } from "@/components/PlanGate";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Send, Sparkles, Loader2, Bot, User,
  TrendingUp, AlertTriangle, FileBarChart, Zap,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

async function callAI(messages: Message[], plan: string): Promise<string> {
  const res = await apiFetch("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages, plan }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur");
  return data.reply as string;
}

function MessageBubble({ message, isGold }: { message: Message; isGold?: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
        isUser
          ? isGold ? "bg-amber-400/20 text-amber-400" : "bg-primary/20 text-primary"
          : "bg-card border border-border text-muted-foreground"
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? isGold
            ? "bg-amber-500 text-white rounded-tr-sm"
            : "bg-primary text-white rounded-tr-sm"
          : "bg-card border border-border text-foreground rounded-tl-sm"
      }`}>
        {message.content}
      </div>
    </div>
  );
}

// ─── Pro Chat ─────────────────────────────────────────────────────────────────

const PRO_SUGGESTIONS = [
  "Analyse ma situation financière",
  "Quelles factures sont en retard ?",
  "Comment améliorer ma marge ?",
  "Quelles tâches devrais-je prioriser ?",
];

function ProChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await callAI(next, "pro");
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Erreur — vérifiez la clé API Mistral." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader title="Assistant IA" subtitle="Analyse financière & recommandations">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            ✦ Plan Pro
          </span>
          <span className="text-[10px] text-muted-foreground bg-card border border-border px-2 py-1 rounded-lg">
            mistral-small
          </span>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-display mb-2">Bonjour, je suis ARIA</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              Posez-moi des questions sur vos finances, clients, projets ou tâches.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {PRO_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="text-left bg-card border border-border hover:border-primary/40 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">ARIA analyse…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-8 pb-6 pt-2 border-t border-border/50">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question à ARIA…" disabled={loading}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:opacity-50" />
          <button type="submit" disabled={!input.trim() || loading}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl transition-colors disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Business Chat ────────────────────────────────────────────────────────────

const BUSINESS_QUICK_ACTIONS = [
  { icon: TrendingUp, label: "Prévision revenus", prompt: "Fais une prévision de revenus pour le prochain trimestre avec des scénarios optimiste, neutre et pessimiste." },
  { icon: AlertTriangle, label: "Anomalies", prompt: "Détecte toutes les anomalies financières, risques et alertes dans mes données actuelles." },
  { icon: FileBarChart, label: "Rapport complet", prompt: "Génère un rapport de performance business complet : finances, projets, clients, tâches, avec recommandations stratégiques." },
  { icon: Zap, label: "Actions prioritaires", prompt: "Liste les 5 actions les plus urgentes à prendre maintenant pour maximiser mes revenus et réduire les risques." },
];

function BusinessChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-load daily insight on first render
  useEffect(() => {
    (async () => {
      setInsightLoading(true);
      try {
        const reply = await callAI([{
          role: "user",
          content: "Donne-moi 3 insights clés sur mon business en ce moment (max 3 lignes chacun, avec un emoji en début de ligne)."
        }], "business");
        setInsight(reply);
      } catch {
        setInsight("Impossible de charger les insights — vérifiez la clé API.");
      } finally {
        setInsightLoading(false);
      }
    })();
  }, []);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await callAI(next, "business");
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Erreur — vérifiez la clé API Mistral." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader title="Assistant IA Avancé" subtitle="Prévisions, rapports & détection d'anomalies">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
            ✦ Plan Business
          </span>
          <span className="text-[10px] text-muted-foreground bg-card border border-border px-2 py-1 rounded-lg">
            mistral-medium
          </span>
        </div>
      </PageHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat — left */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold font-display mb-2">ARIA Business</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-8">
                  IA avancée avec accès complet à vos données. Prévisions, détection d'anomalies et rapports stratégiques.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {BUSINESS_QUICK_ACTIONS.map((a, i) => (
                    <button key={i} onClick={() => send(a.prompt)}
                      className="text-left bg-card border border-amber-500/20 hover:border-amber-400/50 rounded-xl px-4 py-3 text-sm transition-colors group">
                      <a.icon className="w-4 h-4 text-amber-400 mb-2" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => <MessageBubble key={i} message={m} isGold />)}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-card border border-amber-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span className="text-sm text-muted-foreground">ARIA analyse en profondeur…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-6 pb-6 pt-2 border-t border-border/50">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question avancée à ARIA…" disabled={loading}
                className="flex-1 bg-card border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50 transition-colors disabled:opacity-50" />
              <button type="submit" disabled={!input.trim() || loading}
                className="bg-amber-500 hover:bg-amber-400 text-white px-4 py-3 rounded-xl transition-colors disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Insights panel — right */}
        <div className="w-72 border-l border-border flex flex-col bg-[#0D0D15] flex-shrink-0">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold">Insights du jour</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Générés automatiquement</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {insightLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                Analyse en cours…
              </div>
            ) : insight ? (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{insight}</p>
            ) : null}
          </div>
          <div className="p-4 border-t border-border space-y-2">
            {BUSINESS_QUICK_ACTIONS.map((a, i) => (
              <button key={i} onClick={() => send(a.prompt)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-amber-500/30 bg-card hover:bg-amber-400/5 transition-colors text-sm text-muted-foreground hover:text-foreground">
                <a.icon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIPage() {
  const { plan } = useAuth();
  return (
    <PlanGate required="pro">
      {plan === "business" ? <BusinessChat /> : <ProChat />}
    </PlanGate>
  );
}
