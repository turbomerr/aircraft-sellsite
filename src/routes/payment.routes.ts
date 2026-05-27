import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/checkout/:aircraftId", protectRoute, createCheckoutSession);

export default router;