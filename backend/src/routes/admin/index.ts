import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import routesAdmin from "./routes.admin";
import tripsAdmin from "./trips.admin";
import faresAdmin from "./fares.admin";
import usersAdmin from "./users.admin";
import analyticsAdmin from "./analytics";
import importAdmin from "./import";
import imagesAdmin from "./images";

const router = Router();

// Admin & Agent allowed
router.use(requireAuth, requireRole(["ADMIN", "AGENT"]));

router.use("/routes", routesAdmin);
router.use("/trips", tripsAdmin);
router.use("/fares", faresAdmin);
router.use("/analytics", analyticsAdmin);
router.use("/import", importAdmin);
router.use("/images", imagesAdmin);

// Users management: Admin only
router.use("/users", requireRole(["ADMIN"]), usersAdmin);

export default router;
