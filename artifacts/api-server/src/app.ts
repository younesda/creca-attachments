import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import stripeRouter from "./routes/stripe";

const app: Express = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl / Postman / server-to-server
    const allowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".onrender.com");
    callback(allowed ? null : new Error(`CORS bloqué: ${origin}`), allowed);
  },
  credentials: true,
}));

// ⚠️ Webhook Stripe — raw body AVANT express.json()
// La route dans stripe.ts est "/webhook", donc le path final est "/api/webhook"
app.use("/api/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook monté directement (public, pas dans le router protégé)
app.use("/api", stripeRouter);

app.use("/api", router);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Cockpit API is running" });
});

export default app;
