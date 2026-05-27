import express from "express"
import {register, refreshToken, login} from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();


router.post("/auth/register" ,register);
router.post("/auth/login" ,login);
router.post("/auth/refresh-token", refreshToken);


export default router// default oldugu zaman baska yerde caigriken isim serbest 

// export const seklinda yazildigi zaman; {} icinde cagirmak gerekiyor 

