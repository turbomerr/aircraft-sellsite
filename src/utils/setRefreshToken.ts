import type{ Router, Request, Response } from "express";

export const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,        // JS erişemez
        secure: process.env.NODE_ENV === "production",  // Prod'da sadece HTTPS
        sameSite: "strict",   // CSRF koruması
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 gün (ms)
    })
}
