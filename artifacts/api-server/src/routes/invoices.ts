import { Router } from "express";
import { db, invoicesTable, clientsTable } from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";
import { isAtLimit } from "../middleware/plan-gate";

const router = Router();

// GET /invoices
router.get("/invoices", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.userId, req.user!.id))
      .orderBy(desc(invoicesTable.createdAt));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// POST /invoices
router.post("/invoices", async (req, res) => {
  try {
    const userId = req.user!.id;
    const plan = req.user!.plan;

    const [{ value: currentCount }] = await db
      .select({ value: count() })
      .from(invoicesTable)
      .where(eq(invoicesTable.userId, userId));

    if (isAtLimit(plan, "invoices", Number(currentCount))) {
      res.status(403).json({
        error: `Limite de factures atteinte pour le plan ${plan}.`,
        limit: true,
        requiredPlan: "pro",
      });
      return;
    }

    const { client: clientName, clientId, desc: description, amount, date } = req.body as {
      client?: string;
      clientId?: string;
      desc: string;
      amount: number;
      date: string;
    };

    // Résoudre le nom du client depuis le clientId si fourni
    let resolvedClientName = clientName ?? "";
    if (clientId) {
      const [foundClient] = await db
        .select({ name: clientsTable.name })
        .from(clientsTable)
        .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, userId)));
      if (foundClient) resolvedClientName = foundClient.name;
    }

    // Référence unique par utilisateur : FAC-YYYY-NNN
    const year = new Date().getFullYear();
    const [{ value: userTotal }] = await db
      .select({ value: count() })
      .from(invoicesTable)
      .where(eq(invoicesTable.userId, userId));
    const ref = `FAC-${year}-${String(Number(userTotal) + 1).padStart(3, "0")}`;

    const [invoice] = await db
      .insert(invoicesTable)
      .values({
        userId,
        clientId: clientId ?? null,
        ref,
        client: resolvedClientName,
        desc: description ?? "",
        amount: amount ?? 0,
        date: date ?? "",
        status: "En attente",
        statusColor: "warning",
      })
      .returning();

    res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// PATCH /invoices/:id
router.patch("/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: invoicesTable.id })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Facture introuvable." });
      return;
    }

    const { client, clientId, desc: description, amount, date, status, statusColor } = req.body as {
      client?: string;
      clientId?: string;
      desc?: string;
      amount?: number;
      date?: string;
      status?: string;
      statusColor?: string;
    };

    const updates: Record<string, unknown> = {};
    if (client !== undefined) updates.client = client;
    if (clientId !== undefined) updates.clientId = clientId;
    if (description !== undefined) updates.desc = description;
    if (amount !== undefined) updates.amount = amount;
    if (date !== undefined) updates.date = date;
    if (status !== undefined) updates.status = status;
    if (statusColor !== undefined) updates.statusColor = statusColor;

    const [updated] = await db
      .update(invoicesTable)
      .set(updates)
      .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

// DELETE /invoices/:id
router.delete("/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: invoicesTable.id })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Facture introuvable." });
      return;
    }

    await db
      .delete(invoicesTable)
      .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)));

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

export default router;
