import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthedRequest = Request & {
  user?: { id: number };
};

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    
    // Fail if JWT_SECRET is not set (security best practice)
    if (!secret) {
      console.error("🚨 CRITICAL: JWT_SECRET not set in environment!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const payload = jwt.verify(token, secret) as { id: number };

    req.user = { id: payload.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Optional auth middleware - attaches user if token is present, but doesn't require it
 */
export function optionalAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : null;

  if (!token) {
    // No token, continue without user
    next();
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret) as { id: number };
    req.user = { id: payload.id };
  } catch (err) {
    // Invalid token, but continue without user (optional auth)
    console.warn("Invalid token in optional auth:", err);
  }
  
  next();
}

