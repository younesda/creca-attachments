import { Router } from "express";
import { db, transactionsTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";

const router = Router();

// GET /finances
router.get("/finances", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, req.user!.id))
      .orderBy(asc(transactionsTable.createdAt));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// POST /finances
router.post("/finances", async (req, res) => {
  try {
    const { type, name, date, amount, category } = req.body as {
      type: "revenue" | "expense";
      name: string;
      date: string;
      amount: number;
      category?: string;
    };

    const [transaction] = await db
      .insert(transactionsTable)
      .values({
        userId: req.user!.id,
        type,
        name,
        date: date ?? "",
        amount: amount ?? 0,
        category: category ?? null,
      })
      .returning();

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// PATCH /finances/:id
router.patch("/finances/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: transactionsTable.id })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Transaction introuvable." });
      return;
    }

    const { type, name, date, amount, category } = req.body as {
      type?: "revenue" | "expense";
      name?: string;
      date?: string;
      amount?: number;
      category?: string;
    };

    const updates: Record<string, unknown> = {};
    if (type !== undefined) updates.type = type;
    if (name !== undefined) updates.name = name;
    if (date !== undefined) updates.date = date;
    if (amount !== undefined) updates.amount = amount;
    if (category !== undefined) updates.category = category;

    const [updated] = await db
      .update(transactionsTable)
      .set(updates)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// DELETE /finances/:id
router.delete("/finances/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: transactionsTable.id })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Transaction introuvable." });
      return;
    }

    await db
      .delete(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, userId)));

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;
