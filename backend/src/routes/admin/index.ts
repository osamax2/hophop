import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import routesAdmin from "./routes.admin";
import tripsAdmin from "./trips.admin";
import faresAdmin from "./fares.admin";
import fareCategoriesAdmin from "./fare-categories.admin";
import bookingOptionsAdmin from "./booking-options.admin";
import usersAdmin from "./users.admin";
import analyticsAdmin from "./analytics";
import importAdmin from "./import";
import imagesAdmin from "./images";
import companiesAdmin from "./companies.admin";
import ratingsAdmin from "./ratings.admin";
import bookingsAdmin from "./bookings.admin";
import invoicesAdmin from "./invoices.admin";

const router = Router();

// Admin & Agent allowed - include all possible role name variations
router.use(requireAuth, requireRole(["ADMIN", "admin", "Administrator", "AGENT", "agent", "Agent"]));

router.use("/routes", routesAdmin);
router.use("/trips", tripsAdmin);
router.use("/fares", faresAdmin);
router.use("/fare-categories", fareCategoriesAdmin);
router.use("/booking-options", bookingOptionsAdmin);
router.use("/analytics", analyticsAdmin);
router.use("/import", importAdmin);
router.use("/images", imagesAdmin);

// Users management: Admin and Agent (Agent managers see only their company's users)
router.use("/users", usersAdmin);

// Companies management: Admin only
router.use("/companies", requireRole(["ADMIN", "admin", "Administrator"]), companiesAdmin);

// Ratings management: Admin only
// Bookings management: Admin only
router.use("/bookings", requireRole(["ADMIN", "admin", "Administrator"]), bookingsAdmin);

// Invoices management: Admin only
router.use("/invoices", requireRole(["ADMIN", "admin", "Administrator"]), invoicesAdmin);

router.use("/ratings", requireRole(["ADMIN", "admin", "Administrator"]), ratingsAdmin);

export default router;
