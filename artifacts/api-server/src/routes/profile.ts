import { Router } from "express";
import { db, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /profile — retourne le profil de l'utilisateur connecté (ou null)
router.get("/profile", async (req, res) => {
  try {
    const userId = req.user!.id;
    const [profile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, userId));
    res.json(profile ?? null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /profile — upsert du profil
router.put("/profile", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { companyName, email, phone, address, rccm, taxId, website, onboardingCompleted } = req.body as {
      companyName?: string;
      email?: string;
      phone?: string;
      address?: string;
      rccm?: string;
      taxId?: string;
      website?: string;
      onboardingCompleted?: boolean;
    };

    const data = {
      userId,
      companyName: companyName ?? "",
      email: email ?? "",
      phone: phone ?? "",
      address: address ?? "",
      rccm: rccm ?? "",
      taxId: taxId ?? "",
      website: website ?? "",
      ...(onboardingCompleted !== undefined && { onboardingCompleted }),
    };

    const [profile] = await db
      .insert(userProfilesTable)
      .values(data)
      .onConflictDoUpdate({
        target: userProfilesTable.userId,
        set: data,
      })
      .returning();

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

export default router;
