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
          `SELECT r.name
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

      // Map role names to codes (case-insensitive)
      const roleMap: { [key: string]: string } = {
        'administrator': 'admin',
        'admin': 'admin',
        'agent': 'company_admin',
        'user': 'user'
      };
      
      // Collect all role codes
      const userRoles: string[] = [];
      
      // Add system roles
      systemRoles.rows.forEach((row) => {
        const roleName = row.name;
        const roleNameLower = roleName.toLowerCase();
        
        // Add the raw name (e.g., "ADMIN", "AGENT", "Administrator")
        userRoles.push(roleName);
        userRoles.push(roleName.toUpperCase());
        userRoles.push(roleNameLower);
        
        // Add mapped name if it exists (using lowercase key for lookup)
        const mapped = roleMap[roleNameLower];
        if (mapped) {
          userRoles.push(mapped);
          userRoles.push(mapped.toUpperCase());
        }
      });
      
      // Add branch staff roles
      branchRoles.rows.forEach((row) => {
        userRoles.push(row.code);
        userRoles.push(row.code.toLowerCase());
        userRoles.push(row.code.toUpperCase());
      });
      
      // Remove duplicates
      const uniqueRoles = [...new Set(userRoles)];
      
      // Check if user has any of the allowed roles (case-insensitive)
      const hasPermission = allowed.some((allowedRole) => 
        uniqueRoles.some(userRole => 
          userRole.toLowerCase() === allowedRole.toLowerCase()
        )
      );
      
      if (!hasPermission) {
        console.debug("Permission denied for user", userId, "- Required:", allowed, "User has:", uniqueRoles);
        return res.status(403).json({ 
          message: "Forbidden - insufficient permissions",
          required: allowed,
          userRoles: uniqueRoles
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
