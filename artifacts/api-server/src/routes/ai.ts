import { Router } from "express";
import { db, clientsTable, projectsTable, tasksTable, transactionsTable, invoicesTable } from "@workspace/db";
import { eq, count, sum, and } from "drizzle-orm";
import { requirePlan } from "../middleware/plan-gate";

const router = Router();

interface Message {
  role: "user" | "assistant";
  content: string;
}

async function getBusinessContext(userId: string) {
  const [clientCount] = await db
    .select({ value: count() })
    .from(clientsTable)
    .where(eq(clientsTable.userId, userId));

  const [projectCount] = await db
    .select({ value: count() })
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId));

  const [taskCount] = await db
    .select({ value: count() })
    .from(tasksTable)
    .where(and(eq(tasksTable.userId, userId), eq(tasksTable.status, "todo")));

  const [urgentCount] = await db
    .select({ value: count() })
    .from(tasksTable)
    .where(and(
      eq(tasksTable.userId, userId),
      eq(tasksTable.status, "todo"),
      eq(tasksTable.priorityColor, "danger")
    ));

  const [revenueSum] = await db
    .select({ value: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.userId, userId), eq(transactionsTable.type, "revenue")));

  const [expenseSum] = await db
    .select({ value: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.userId, userId), eq(transactionsTable.type, "expense")));

  const [pendingInvoicesSum] = await db
    .select({ value: sum(invoicesTable.amount) })
    .from(invoicesTable)
    .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.status, "En attente")));

  const [pendingInvoicesCount] = await db
    .select({ value: count() })
    .from(invoicesTable)
    .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.status, "En attente")));

  const totalRevenue = Number(revenueSum?.value ?? 0);
  const totalExpenses = Number(expenseSum?.value ?? 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";

  return `
Données business en temps réel :
- Clients actifs : ${clientCount.value}
- Projets en cours : ${projectCount.value}
- Tâches à faire : ${taskCount.value} (dont ${urgentCount.value} urgentes)
- Revenus total : ${totalRevenue.toLocaleString("fr-FR")}€
- Dépenses total : ${totalExpenses.toLocaleString("fr-FR")}€
- Bénéfice net : ${netProfit.toLocaleString("fr-FR")}€ (marge ${margin}%)
- Factures en attente : ${pendingInvoicesCount.value} factures — ${Number(pendingInvoicesSum?.value ?? 0).toLocaleString("fr-FR")}€ à encaisser
`.trim();
}

// POST /ai/chat — accessible aux plans pro et business
router.post("/ai/chat", requirePlan("pro"), async (req, res) => {
  if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY === "your_mistral_key_here") {
    res.status(503).json({ error: "Clé API Mistral non configurée. Contactez l'administrateur." });
    return;
  }

  const { messages } = req.body as { messages: Message[] };
  const plan = req.user!.plan;
  const userId = req.user!.id;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages requis" });
    return;
  }

  try {
    const businessContext = await getBusinessContext(userId);
    const model = plan === "business" ? "mistral-medium-latest" : "mistral-small-latest";

    const systemPrompt = `Tu es ARIA, l'assistante IA intégrée à Cockpit, une plateforme de gestion d'entreprise pour entrepreneurs et freelances.
Tu aides l'utilisateur à analyser son activité, prendre de meilleures décisions et anticiper les risques.

${businessContext}

Tes capacités selon le plan :
${plan === "business"
  ? `- Plan Business : analyses approfondies, prévisions de revenus, détection d'anomalies, rapports automatiques, recommandations stratégiques.`
  : `- Plan Pro : analyse financière, alertes intelligentes, suggestions d'actions concrètes.`
}

Règles :
- Réponds toujours en français
- Sois concis, direct et actionnable
- Utilise des chiffres précis issus des données
- Détecte les anomalies ou risques si tu en vois
- Propose toujours une action concrète à la fin de ta réponse`;

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: plan === "business" ? 1024 : 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Mistral error:", err);
      res.status(502).json({ error: "Erreur API Mistral" });
      return;
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[];
    };
    const reply = data.choices[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
