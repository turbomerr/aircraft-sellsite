import express from "express"
import { protectRoute } from "../middleware/protectRoute.js";
import {createOffer, getMyOffers, getOffersMyAircraft, respondOffer, cancelOffer} from "../controllers/offer.controller.js"

const router = express.Router();

router.post("/offer/:aircraftId", protectRoute, createOffer);
router.get("/offer/my/sent", protectRoute, getMyOffers);
router.get("/offer/my/received", protectRoute, getOffersMyAircraft);
router.patch("/offer/:offerId/respond", protectRoute, respondOffer)
router.patch("/offer/:offerId/cancel", protectRoute, cancelOffer)


export default router;