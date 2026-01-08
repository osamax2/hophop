import { Response, NextFunction } from "express";
import { pool } from "../db";
import { AuthedRequest } from "./auth";

export function requireRole(allowed: string[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // Get user roles from database (both system roles and branch staff roles)
      const [systemRoles, branchRoles] = await Promise.all([
        pool.query(
          `SELECT r.name, r.code
           FROM user_roles ur
           JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT bsr.code, bsr.name
           FROM users u
           JOIN branch_staff_roles bsr ON u.branch_staff_role_id = bsr.id
           WHERE u.id = $1`,
          [userId]
        )
      ]);

      // Map role names to codes
      const roleMap: { [key: string]: string } = {
        'Administrator': 'admin',
        'Agent': 'company_admin',
        'User': 'user'
      };
      
      // Collect all role codes
      const userRoles: string[] = [];
      
      // Add system roles
      systemRoles.rows.forEach((row) => {
        const mapped = roleMap[row.name] || row.code?.toLowerCase() || row.name.toLowerCase();
        userRoles.push(mapped);
      });
      
      // Add branch staff roles
      branchRoles.rows.forEach((row) => {
        userRoles.push(row.code.toLowerCase());
      });
      
      // Check if user has any of the allowed roles
      const hasPermission = allowed.some((allowedRole) => 
        userRoles.includes(allowedRole.toLowerCase())
      );
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: "Forbidden - insufficient permissions",
          required: allowed,
          userRoles: userRoles
        });
      }

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
