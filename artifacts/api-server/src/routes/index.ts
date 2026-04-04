import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth";
import healthRouter from "./health";
import clientsRouter from "./clients";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import financesRouter from "./finances";
import invoicesRouter from "./invoices";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";
import profileRouter from "./profile";

const router: IRouter = Router();

// ─── Public (sans auth) ──────────────────────────────────────────────────────
router.use(healthRouter);

// ─── Protégé (JWT requis sur toutes les routes ci-dessous) ──────────────────
router.use(requireAuth);

router.use(clientsRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use(financesRouter);
router.use(invoicesRouter);
router.use(analyticsRouter);
router.use(aiRouter);
router.use(profileRouter);

export default router;
