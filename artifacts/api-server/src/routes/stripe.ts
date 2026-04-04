import { Router, raw } from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth";

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_REMPLACER") throw new Error("STRIPE_SECRET_KEY non configurée");
  return new Stripe(key);
}

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const PRICE_IDS: Record<string, string | undefined> = {
  pro:      process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

// ─── POST /stripe/create-checkout ────────────────────────────────────────────
// Protégé par JWT — crée une session Stripe Checkout
router.post("/stripe/create-checkout", requireAuth, async (req, res) => {
  const { plan } = req.body as { plan: "pro" | "business" };
  const userId = req.user!.id;
  const email  = req.user!.email;

  if (!plan || !PRICE_IDS[plan]) {
    res.status(400).json({ error: "Plan invalide ou prix non configuré." });
    return;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/app?upgrade=success&plan=${plan}`,
      cancel_url:  `${process.env.FRONTEND_URL}/app?upgrade=cancelled`,
      metadata:    { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ error: err.message ?? "Erreur Stripe" });
  }
});

// ─── POST /stripe/webhook ─────────────────────────────────────────────────────
// PUBLIC — raw body requis pour vérification de signature
// Monté avec express.raw() dans app.ts avant express.json()
router.post("/stripe/webhook", raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret || webhookSecret === "whsec_REMPLACER") {
    res.status(400).json({ error: "Webhook secret non configuré" });
    return;
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.CheckoutSession;
        const { userId, plan } = session.metadata ?? {};
        if (userId && plan) {
          const admin = getSupabaseAdmin();
          await admin.auth.admin.updateUserById(userId, {
            user_metadata: { plan },
          });
          console.log(`✅ Plan mis à jour → ${plan} pour user ${userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Abonnement annulé → repasser en free
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          const admin = getSupabaseAdmin();
          await admin.auth.admin.updateUserById(userId, {
            user_metadata: { plan: "free" },
          });
          console.log(`⬇️ Plan repassé à free pour user ${userId}`);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: "Erreur traitement webhook" });
  }
});

export default router;
