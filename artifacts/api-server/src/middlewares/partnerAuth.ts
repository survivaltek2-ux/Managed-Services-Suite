import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const PARTNER_JWT_SECRET = process.env.JWT_SECRET || "siebert-services-secret-key-2024";

export const MAIN_SITE_ADMIN_SENTINEL = -999;

export interface PartnerRequest extends Request {
  partnerId?: number;
  partnerIsAdmin?: boolean;
  mainSiteUserId?: number;
}

interface PartnerTokenPayload {
  partnerId: number;
  isAdmin?: boolean;
}

interface AdminTokenPayload {
  userId: number;
  role: string;
}

function isPartnerTokenPayload(payload: unknown): payload is PartnerTokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).partnerId === "number"
  );
}

function isAdminTokenPayload(payload: unknown): payload is AdminTokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).userId === "number" &&
    (payload as Record<string, unknown>).role === "admin"
  );
}

export function requirePartnerAuth(req: PartnerRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return;
  }

  const token = authHeader.substring(7);
  let payload: unknown;
  try {
    payload = jwt.verify(token, PARTNER_JWT_SECRET);
  } catch {
    res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
    return;
  }

  if (isAdminTokenPayload(payload)) {
    req.partnerId = MAIN_SITE_ADMIN_SENTINEL;
    req.mainSiteUserId = payload.userId;
    req.partnerIsAdmin = true;
    next();
    return;
  }

  if (isPartnerTokenPayload(payload)) {
    req.partnerId = payload.partnerId;
    req.partnerIsAdmin = payload.isAdmin === true;
    next();
    return;
  }

  res.status(401).json({ error: "unauthorized", message: "Invalid token payload" });
}

export function requirePartnerAdmin(req: PartnerRequest, res: Response, next: NextFunction) {
  requirePartnerAuth(req, res, () => {
    if (!req.partnerIsAdmin) {
      res.status(403).json({ error: "forbidden", message: "Admin access required" });
      return;
    }
    next();
  });
}

export function generatePartnerToken(partnerId: number, isAdmin = false): string {
  return jwt.sign({ partnerId, isAdmin }, PARTNER_JWT_SECRET, { expiresIn: "30d" });
}
