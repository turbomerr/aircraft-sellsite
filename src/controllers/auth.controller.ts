import type { NextFunction, Request, Response, } from "express"
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js"
import bcryptjs from "bcryptjs"
import { generateToken } from "../utils/generateToken.js"
import { setRefreshTokenCookie } from "../utils/setRefreshToken.js"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import type { TokenPayload, TokenPair } from "../types/types.js"
import type{RegisterBody, LoginBody} from "../types/types.js"

dotenv.config()

//Request<Params, ResBody, ReqBody, ReqQuery, Locals>


export const register = async (req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError("User already exist", 400)
        }

        //password hashing
        const hashedPassword = await bcryptjs.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        // create accestoken and refreshtoken for registered user  
        const { accessToken, refreshToken } = generateToken(user._id.toString(), user.role)

        console.log("Refreshtoken", refreshToken)
        user.refreshToken = refreshToken;
        await user.save();

        //refresh token i res.cookie icinde saklariz
        setRefreshTokenCookie(res, refreshToken)

        return res.status(201).json({
            message: "User registered",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    }
}


export const login = async (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new AppError("Fields are missing", 401)
        }

        const user = await User.findOne({ email })

        if (!user) {
            throw new AppError("User not found !", 401)
        }

        const isMatch = await bcryptjs.compare(password, user.password)
        if (!isMatch) {
            throw new AppError("Password not match", 401)
        }

        const { accessToken, refreshToken } = generateToken(user._id.toString(), user.role)

        user.refreshToken = refreshToken;
        await user.save();

        setRefreshTokenCookie(res, refreshToken);

        return res.json({
            message: "User loged in",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })



    } catch (error) {
        next(error)
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new AppError("Token is not provided", 401);
        }
        const { JWT_REFRESH_SECRET } = process.env;

        if (!JWT_REFRESH_SECRET) {
            throw new AppError("JWT_REFRESH_SECRET is missing", 500);
        }

        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;
        //TokenPayload = {userId, role}

        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new AppError("User not found", 404)
        }
        if (user.refreshToken !== refreshToken) {
            throw new AppError("Invalid refresh token", 401);
        }

        const { accessToken, refreshToken: newRefreshToken } = generateToken(user._id.toString(), user.role);

        user.refreshToken = newRefreshToken;
        await user.save()

        setRefreshTokenCookie(res, newRefreshToken);
        return res.status(200).json({
            accessToken
        })
    } catch (error) {
        next(error)
    }
}

