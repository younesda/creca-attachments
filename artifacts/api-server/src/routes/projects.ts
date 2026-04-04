import { Router } from "express";
import { db, projectsTable, clientsTable } from "@workspace/db";
import { eq, and, asc, count } from "drizzle-orm";
import { isAtLimit } from "../middleware/plan-gate";

const router = Router();

// GET /projects
router.get("/projects", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, req.user!.id))
      .orderBy(asc(projectsTable.createdAt));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST /projects
router.post("/projects", async (req, res) => {
  try {
    const userId = req.user!.id;
    const plan = req.user!.plan;

    const [{ value: currentCount }] = await db
      .select({ value: count() })
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId));

    if (isAtLimit(plan, "projects", Number(currentCount))) {
      res.status(403).json({
        error: `Limite de projets atteinte pour le plan ${plan}.`,
        limit: true,
        requiredPlan: "pro",
      });
      return;
    }

    const { name, client: clientName, clientId, budget, dates } = req.body as {
      name: string;
      client?: string;
      clientId?: string;
      budget: number;
      dates: string;
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

    const [project] = await db
      .insert(projectsTable)
      .values({
        userId,
        clientId: clientId ?? null,
        name,
        client: resolvedClientName,
        budget: budget ?? 0,
        dates: dates ?? "",
        status: "En cours",
        statusColor: "info",
        progress: 0,
      })
      .returning();

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PATCH /projects/:id
router.patch("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Projet introuvable." });
      return;
    }

    const { name, client, clientId, budget, dates, status, statusColor, progress } = req.body as {
      name?: string;
      client?: string;
      clientId?: string;
      budget?: number;
      dates?: string;
      status?: string;
      statusColor?: string;
      progress?: number;
    };

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (client !== undefined) updates.client = client;
    if (clientId !== undefined) updates.clientId = clientId;
    if (budget !== undefined) updates.budget = budget;
    if (dates !== undefined) updates.dates = dates;
    if (status !== undefined) updates.status = status;
    if (statusColor !== undefined) updates.statusColor = statusColor;
    if (progress !== undefined) updates.progress = progress;

    const [updated] = await db
      .update(projectsTable)
      .set(updates)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /projects/:id
router.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Projet introuvable." });
      return;
    }

    await db
      .delete(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
