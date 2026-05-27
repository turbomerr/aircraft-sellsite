import jwt from "jsonwebtoken"
import {AppError} from "./AppError.js"
import dotenv from "dotenv"
import type{TokenPayload, TokenPair} from "../types/types.js"



dotenv.config()

//generate access and refresh token when user logged in or sign up 

export const generateToken = (userId : string, role : "admin" | "user"):TokenPair => {

    const {JWT_SECRET, JWT_REFRESH_TOKEN} = process.env;

    if(!JWT_SECRET || !JWT_REFRESH_TOKEN){
        throw new AppError("Jwt secrets are missing", 401)
    }
    const payload : TokenPayload = {userId, role};

    const accessToken = jwt.sign(payload, JWT_SECRET, {expiresIn : "15m"})
    const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN, {expiresIn : "7d"});

    return {accessToken, refreshToken};
    
}