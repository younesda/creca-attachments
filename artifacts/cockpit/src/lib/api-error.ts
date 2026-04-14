/**
 * Erreur levée quand l'API répond 403 avec { limit: true }
 * Permet aux composants de détecter une limite de plan dépassée
 * et d'afficher un message d'upgrade au lieu d'un message générique.
 */
export class LimitError extends Error {
  public readonly isLimitError = true;
  constructor(message: string) {
    super(message);
    this.name = "LimitError";
  }
}

export function isLimitError(err: unknown): err is LimitError {
  return err instanceof LimitError;
}

/**
 * Parse la réponse API et lève LimitError si c'est une limite de plan,
 * ou Error standard sinon.
 */
export async function throwApiError(res: Response, context: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  if (res.status === 403 && body?.limit === true) {
    throw new LimitError(body?.error ?? `Limite atteinte — ${context}`);
  }
  throw new Error(body?.error ?? `Erreur ${res.status} — ${context}`);
}
