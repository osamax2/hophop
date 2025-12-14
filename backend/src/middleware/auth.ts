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
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret) as { id: number };

    req.user = { id: payload.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
