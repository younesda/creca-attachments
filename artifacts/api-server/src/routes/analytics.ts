import { Router } from "express";
import { db, transactionsTable, invoicesTable, clientsTable, projectsTable, tasksTable } from "@workspace/db";
import { eq, and, sum, count, sql } from "drizzle-orm";
import { requirePlan } from "../middleware/plan-gate";

const router = Router();

// GET /analytics/summary — KPIs réels de l'utilisateur
router.get("/analytics/summary", requirePlan("pro"), async (req, res) => {
  try {
    const userId = req.user!.id;
    const currentYear = new Date().getFullYear();

    const [revenueYTD] = await db
      .select({ value: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.type, "revenue"),
        sql`EXTRACT(YEAR FROM ${transactionsTable.createdAt}) = ${currentYear}`
      ));

    const [expensesYTD] = await db
      .select({ value: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.type, "expense"),
        sql`EXTRACT(YEAR FROM ${transactionsTable.createdAt}) = ${currentYear}`
      ));

    const totalRevenueCents = Number(revenueYTD?.value ?? 0);
    const totalExpensesCents = Number(expensesYTD?.value ?? 0);
    const netProfitCents = totalRevenueCents - totalExpensesCents;
    const margin = totalRevenueCents > 0 ? ((netProfitCents / totalRevenueCents) * 100) : 0;

    // MRR : moyenne CA des 3 derniers mois (en centimes, puis converti)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [revenueRecent] = await db
      .select({ value: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.type, "revenue"),
        sql`${transactionsTable.createdAt} >= ${threeMonthsAgo.toISOString()}`
      ));

    const mrrCents = Math.round(Number(revenueRecent?.value ?? 0) / 3);

    const [pendingInvoicesSum] = await db
      .select({ value: sum(invoicesTable.amount) })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.status, "En attente")));

    const [pendingInvoicesCount] = await db
      .select({ value: count() })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.status, "En attente")));

    const [clientCount] = await db
      .select({ value: count() })
      .from(clientsTable)
      .where(eq(clientsTable.userId, userId));

    const [projectCount] = await db
      .select({ value: count() })
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId));

    const [urgentTaskCount] = await db
      .select({ value: count() })
      .from(tasksTable)
      .where(and(
        eq(tasksTable.userId, userId),
        eq(tasksTable.status, "todo"),
        eq(tasksTable.priorityColor, "danger")
      ));

    res.json({
      caYTD: totalRevenueCents,
      expensesYTD: totalExpensesCents,
      netProfit: netProfitCents,
      margin: Math.round(margin * 10) / 10,
      mrr: mrrCents,
      pendingInvoicesAmount: Number(pendingInvoicesSum?.value ?? 0),
      pendingInvoicesCount: Number(pendingInvoicesCount?.value ?? 0),
      clientCount: Number(clientCount?.value ?? 0),
      projectCount: Number(projectCount?.value ?? 0),
      urgentTaskCount: Number(urgentTaskCount?.value ?? 0),
      year: currentYear.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
});

// GET /analytics/revenue-trend — évolution mensuelle sur 12 mois
router.get("/analytics/revenue-trend", requirePlan("pro"), async (req, res) => {
  try {
    const userId = req.user!.id;

    const rows = await db
      .select({
        month: sql<string>`TO_CHAR(${transactionsTable.createdAt}, 'YYYY-MM')`,
        revenues: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'revenue' THEN ${transactionsTable.amount} ELSE 0 END), 0)`,
        expenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END), 0)`,
      })
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, userId),
        sql`${transactionsTable.createdAt} >= NOW() - INTERVAL '12 months'`
      ))
      .groupBy(sql`TO_CHAR(${transactionsTable.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactionsTable.createdAt}, 'YYYY-MM') ASC`);

    const MONTH_LABELS: Record<string, string> = {
      "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr",
      "05": "Mai", "06": "Juin", "07": "Juil", "08": "Août",
      "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc",
    };

    const formatted = rows.map((row) => {
      const rev = Number(row.revenues);
      const exp = Number(row.expenses);
      return {
        name: MONTH_LABELS[row.month.split("-")[1]] ?? row.month,
        month: row.month,
        revenues: rev,
        expenses: exp,
        net: rev - exp,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch revenue trend" });
  }
});

// GET /analytics/expenses-by-category
router.get("/analytics/expenses-by-category", requirePlan("pro"), async (req, res) => {
  try {
    const userId = req.user!.id;

    const rows = await db
      .select({
        name: sql<string>`COALESCE(${transactionsTable.category}, 'Autre')`,
        value: sql<number>`SUM(${transactionsTable.amount})`,
      })
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.type, "expense")
      ))
      .groupBy(sql`COALESCE(${transactionsTable.category}, 'Autre')`)
      .orderBy(sql`SUM(${transactionsTable.amount}) DESC`);

    res.json(rows.map((r) => ({
      name: r.name,
      value: Number(r.value),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch expenses by category" });
  }
});

export default router;
