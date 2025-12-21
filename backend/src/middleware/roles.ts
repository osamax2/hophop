import { Response, NextFunction } from "express";
import { pool } from "../db";
import { AuthedRequest } from "./auth";

export function requireRole(allowed: string[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // Get user roles from database
      const r = await pool.query(
        `
        SELECT r.name
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1
        `,
        [userId]
      );

      // Map role names to codes: Administrator -> ADMIN, Agent -> AGENT, User -> USER
      const roleMap: { [key: string]: string } = {
        'Administrator': 'ADMIN',
        'Agent': 'AGENT',
        'User': 'USER'
      };
      
      const codes = r.rows.map((x) => roleMap[x.name] || x.name.toUpperCase());
      const ok = allowed.some((a) => codes.includes(a.toUpperCase()));
      if (!ok) return res.status(403).json({ message: "Forbidden" });

      return next();
    } catch (e: any) {
      console.error("requireRole error:", e);
      console.error("requireRole error stack:", e?.stack);
      console.error("requireRole error message:", e?.message);
      // Return 403 instead of 500 to avoid masking authentication errors
      return res.status(403).json({ message: "Role check failed", error: String(e) });
    }
  };
}
