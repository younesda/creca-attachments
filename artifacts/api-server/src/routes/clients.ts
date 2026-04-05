import { Router } from "express";
import { db, clientsTable, invoicesTable } from "@workspace/db";
import { eq, and, asc, count, sum } from "drizzle-orm";
import { isAtLimit } from "../middleware/plan-gate";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /clients — liste les clients avec CA réel calculé depuis les factures
router.get("/clients", requireAuth, async (req, res) => {
    try {
    const userId = req.user!.id;

    const [clients, invoiceSums] = await Promise.all([
      db
        .select()
        .from(clientsTable)
        .where(eq(clientsTable.userId, userId))
        .orderBy(asc(clientsTable.createdAt)),
      db
        .select({ clientId: invoicesTable.clientId, total: sum(invoicesTable.amount) })
        .from(invoicesTable)
        .where(eq(invoicesTable.userId, userId))
        .groupBy(invoicesTable.clientId),
    ]);

    const revenueMap = new Map(
      invoiceSums.map(r => [r.clientId, Number(r.total ?? 0)])
    );

    res.json(clients.map(c => ({ ...c, revenue: revenueMap.get(c.id) ?? 0 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// POST /clients — crée un client (vérifie le quota du plan)
router.post("/clients", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const plan = req.user!.plan;

    const [{ value: currentCount }] = await db
      .select({ value: count() })
      .from(clientsTable)
      .where(eq(clientsTable.userId, userId));

    if (isAtLimit(plan, "clients", Number(currentCount))) {
      res.status(403).json({
        error: `Limite de clients atteinte pour le plan ${plan}.`,
        limit: true,
        requiredPlan: "pro",
      });
      return;
    }

    const { name, sector, email, phone, city } = req.body as {
      name: string;
      sector: string;
      email: string;
      phone?: string;
      city?: string;
    };

    const gradients = [
      "from-[#7C3AED] to-[#9333EA]",
      "from-[#3B82F6] to-[#60A5FA]",
      "from-[#22C55E] to-[#4ADE80]",
      "from-[#F59E0B] to-[#FBBF24]",
      "from-[#EF4444] to-[#F87171]",
    ];
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];

    const [client] = await db
      .insert(clientsTable)
      .values({
        userId,
        name,
        sector: sector ?? "",
        email: email ?? "",
        phone: phone ?? "",
        city: city ?? "",
        initials: name.substring(0, 2).toUpperCase(),
        gradient,
        statusText: "Nouveau",
        statusColor: "info",
        revenue: 0,
      })
      .returning();

    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// PATCH /clients/:id — met à jour un client
router.patch("/clients/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Client introuvable." });
      return;
    }

    const { name, sector, email, phone, city, statusText, statusColor } = req.body as {
      name?: string;
      sector?: string;
      email?: string;
      phone?: string;
      city?: string;
      statusText?: string;
      statusColor?: string;
    };

    const updates: Record<string, unknown> = {};
    if (name !== undefined) { updates.name = name; updates.initials = name.substring(0, 2).toUpperCase(); }
    if (sector !== undefined) updates.sector = sector;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (city !== undefined) updates.city = city;
    if (statusText !== undefined) updates.statusText = statusText;
    if (statusColor !== undefined) updates.statusColor = statusColor;

    const [updated] = await db
      .update(clientsTable)
      .set(updates)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// DELETE /clients/:id — supprime un client
router.delete("/clients/:id", requireAuth, async (req, res) => {
    try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const [existing] = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Client introuvable." });
      return;
    }

    await db
      .delete(clientsTable)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)));

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

export default router;
