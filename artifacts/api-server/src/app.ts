import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import stripeRouter from "./routes/stripe";

const app: Express = express();

app.use(cors());

// ⚠️ Webhook Stripe — raw body AVANT express.json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook monté directement (public, pas dans le router protégé)
app.use("/api", stripeRouter);

app.use("/api", router);

export default app;
