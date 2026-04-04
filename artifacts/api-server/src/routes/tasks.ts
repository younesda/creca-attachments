import { Router } from "express";
import { db, tasksTable } from "@workspace/db";
import { eq, and, asc, count } from "drizzle-orm";
import { isAtLimit } from "../middleware/plan-gate";

const router = Router();

// GET /tasks
router.get("/tasks", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.userId, req.user!.id))
      .orderBy(asc(tasksTable.createdAt));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST /tasks
router.post("/tasks", async (req, res) => {
  try {
    const userId = req.user!.id;
    const plan = req.user!.plan;

    const [{ value: currentCount }] = await db
      .select({ value: count() })
      .from(tasksTable)
      .where(eq(tasksTable.userId, userId));

    if (isAtLimit(plan, "tasks", Number(currentCount))) {
      res.status(403).json({
        error: `Limite de tâches atteinte pour le plan ${plan}.`,
        limit: true,
        requiredPlan: "pro",
      });
      return;
    }

    const { name, date, priority, priorityColor } = req.body as {
      name: string;
      date: string;
      priority: string;
      priorityColor: string;
    };

    const [task] = await db
      .insert(tasksTable)
      .values({
        userId,
        name,
        date: date ?? "",
        priority: priority ?? "Normal",
        priorityColor: priorityColor ?? "info",
        status: "todo",
      })
      .returning();

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PATCH /tasks/:id/toggle — bascule todo ↔ done
router.patch("/tasks/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [current] = await db
      .select({ status: tasksTable.status })
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));

    if (!current) {
      res.status(404).json({ error: "Tâche introuvable." });
      return;
    }

    const newStatus = current.status === "done" ? "todo" : "done";

    const [updated] = await db
      .update(tasksTable)
      .set({ status: newStatus })
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

// PATCH /tasks/:id — met à jour une tâche
router.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: tasksTable.id })
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Tâche introuvable." });
      return;
    }

    const { name, date, priority, priorityColor, status } = req.body as {
      name?: string;
      date?: string;
      priority?: string;
      priorityColor?: string;
      status?: string;
    };

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (date !== undefined) updates.date = date;
    if (priority !== undefined) updates.priority = priority;
    if (priorityColor !== undefined) updates.priorityColor = priorityColor;
    if (status !== undefined) updates.status = status;

    const [updated] = await db
      .update(tasksTable)
      .set(updates)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /tasks/:id
router.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: tasksTable.id })
      .from(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Tâche introuvable." });
      return;
    }

    await db
      .delete(tasksTable)
      .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, userId)));

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
