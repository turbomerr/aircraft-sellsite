import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"
import type { TokenPair, TokenPayload } from "../types/types.js"
import { AppError } from "../utils/AppError.js";
import dotenv from "dotenv"

dotenv.config()


// req.user = decoded yazabilmek icin Request icine user tanimliyoruz
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const protectRoute = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("No token provided", 401)
        }
        const token = authHeader.split(" ")[1];  // "Bearer " kısmını at
        if (!token) {
            throw new AppError("Not authorized, token missing", 401);
        }
        if (!process.env.JWT_SECRET) {
            throw new AppError("JWT_SECRET key is missing", 401)
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload
        req.user = decoded
        next()


    } catch (error) {
        next(error)
    }
}

