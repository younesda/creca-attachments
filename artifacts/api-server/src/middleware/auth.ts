import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Plan = "free" | "pro" | "business";

export interface AuthUser {
  id: string;
  email: string;
  plan: Plan;
}

// Augmente le type Request d'Express pour porter req.user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token d'authentification manquant." });
    return;
  }

  const token = authHeader.substring(7);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Token invalide ou expiré." });
    return;
  }

  req.user = {
    id: user.id,
    email: user.email ?? "",
    plan: (user.user_metadata?.plan as Plan) ?? "free",
  };

  next();
}
