import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const PARTNER_JWT_SECRET = process.env.JWT_SECRET || "siebert-services-secret-key-2024";

export interface PartnerRequest extends Request {
  partnerId?: number;
}

export function requirePartnerAuth(req: PartnerRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, PARTNER_JWT_SECRET) as { partnerId: number };
    req.partnerId = payload.partnerId;
    next();
  } catch {
    res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
  }
}

export function generatePartnerToken(partnerId: number): string {
  return jwt.sign({ partnerId }, PARTNER_JWT_SECRET, { expiresIn: "30d" });
}
