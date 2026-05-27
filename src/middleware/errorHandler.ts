import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";


export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({message : err.message})
    }
    //eger tanimladigimiz hatalar disinda bir hata olursa 
    console.log("Unexpected error ", err)
    return res.status(500).json({ message: "Internal server error"});
}