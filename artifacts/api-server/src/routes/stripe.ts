import { Router, raw } from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth";

const router = Router();

// ─────────────────────────────────────────────────────────
// INIT STRIPE
// ─────────────────────────────────────────────────────────
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key || key === "sk_test_REMPLACER") {
    throw new Error("STRIPE_SECRET_KEY non configurée");
  }

  return new Stripe(key, {
    apiVersion: "2023-10-16",
  });
}

// ─────────────────────────────────────────────────────────
// SUPABASE ADMIN
// ─────────────────────────────────────────────────────────
function getSupabaseAdmin() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase non configuré");
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─────────────────────────────────────────────────────────
// PRICES
// ─────────────────────────────────────────────────────────
const PRICE_IDS: Record<"pro" | "business", string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

// ─────────────────────────────────────────────────────────
// CREATE CHECKOUT
// ─────────────────────────────────────────────────────────
router.post("/stripe/create-checkout", requireAuth, async (req, res) => {
  const { plan } = req.body as { plan: "pro" | "business" };
  const userId = req.user!.id;
  const email = req.user!.email;

  if (!plan || !PRICE_IDS[plan]) {
    return res.status(400).json({
      error: "Plan invalide ou prix non configuré",
    });
  }

  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/app?upgrade=success&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/app?upgrade=cancelled`,
      metadata: { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
      },
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({
      error: err?.message ?? "Erreur Stripe",
    });
  }
});

// ─────────────────────────────────────────────────────────
// WEBHOOK
// ─────────────────────────────────────────────────────────
router.post(
  "/webhook",
  raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // 🔒 SAFE HEADER
    if (!signature || Array.isArray(signature)) {
      return res.status(400).send("Invalid Stripe signature");
    }

    if (!webhookSecret || webhookSecret === "whsec_REMPLACER") {
      return res.status(400).send("Webhook secret non configuré");
    }

    let event: Stripe.Event;

    try {
      const stripe = getStripe();

      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan;

          if (userId && plan) {
            const admin = getSupabaseAdmin();

            await admin.auth.admin.updateUserById(userId, {
              user_metadata: { plan },
            });

            console.log(`✅ Plan ${plan} activé pour user ${userId}`);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;

          const userId = subscription.metadata?.userId;

          if (userId) {
            const admin = getSupabaseAdmin();

            await admin.auth.admin.updateUserById(userId, {
              user_metadata: { plan: "free" },
            });

            console.log(`⬇️ Plan downgradé (free) pour user ${userId}`);
          }
          break;
        }

        default:
          console.log(`ℹ️ Event ignoré: ${event.type}`);
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err);
      return res.status(500).json({
        error: "Erreur traitement webhook",
      });
    }
  }
);

export default router;