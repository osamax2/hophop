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
import companiesAdmin from "./companies.admin";
import ratingsAdmin from "./ratings.admin";
import bookingsAdmin from "./bookings.admin";
import invoicesAdmin from "./invoices.admin";

const router = Router();

// Admin & Agent allowed
router.use(requireAuth, requireRole(["ADMIN", "AGENT"]));

router.use("/routes", routesAdmin);
router.use("/trips", tripsAdmin);
router.use("/fares", faresAdmin);
router.use("/analytics", analyticsAdmin);
router.use("/import", importAdmin);
router.use("/images", imagesAdmin);

// Users management: Admin and Agent (Agent managers see only their company's users)
router.use("/users", usersAdmin);

// Companies management: Admin only
router.use("/companies", requireRole(["ADMIN"]), companiesAdmin);

// Ratings management: Admin only
// Bookings management: Admin only
router.use("/bookings", requireRole(["ADMIN"]), bookingsAdmin);

// Invoices management: Admin only
router.use("/invoices", requireRole(["ADMIN"]), invoicesAdmin);

router.use("/ratings", requireRole(["ADMIN"]), ratingsAdmin);

export default router;
