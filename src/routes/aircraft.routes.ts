import express from "express"
import {createAircraft, getAircrafts, getAircraftsById, updateAircraft, deleteAircraft} from "../controllers/aircraft.controller.js"
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router()

router.get("/aircraft", getAircrafts)
router.get("/aircraft/:aircraftId", getAircraftsById)
router.post("/aircraft", protectRoute ,createAircraft)
router.patch("/aircraft/:aircraftId", protectRoute ,updateAircraft)
router.delete("/aircraft/:aircraftId", protectRoute ,deleteAircraft)


export default router;