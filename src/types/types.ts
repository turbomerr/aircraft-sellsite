import type { Types } from "mongoose"

export type AircraftParams = {
    aircraftId: string;
}

export type aircraftType = "commercial" | "private" | "cargo" | "helicopter";
export type engineType = "jet" | "turboprop" | "piston" | "electric";

export type AircraftBody = {
    manufacturer: string,
    model: string,
    year: number,
    price: number,
    aircraftType: aircraftType,
    engineType: engineType,
    totalFlightHours: number,
    cruiseSpeed: number,
    images: Array<string>,
    description: string,
}

export type RegisterBody = {
    name: string,
    email: string,
    password: string
}

export type LoginBody = {
    email: string,
    password: string
}

export type TokenPair = {
    accessToken: string,
    refreshToken: string
};

export type TokenPayload = {
    userId: string,
    role: UserRole
}

export type UserRole = "user" | "admin";


export type listingStatus = "available" | "under_offer" | "sold";
//model icin type kontrolu 
export interface IAircraft { //extends Document yazmaya gerek yok Schema ve model in yanina yazdigimiz zaman mongoose bunu algiliyor 
    owner: Types.ObjectId,
    manufacturer: string,
    model: string, //Documents icindeki model ile cakisma olur 
    year: number,
    price: number,
    aircraftType: aircraftType,
    engineType: engineType,
    totalFlightHours: number,
    cruiseSpeed: number,
    images: Array<string>,
    description: string,
    isPremium: boolean,
    isActive: boolean,
    listingStatus : listingStatus,
    acceptedOffer : Types.ObjectId,
    acceptedOfferPrice : number,
    soldPrice : number,
    soldAt : Date
    
}

export type status = "pending" | "accepted" | "rejected" | "cancelled" | "expired";

export interface IOffer {
    aircraft: Types.ObjectId,
    buyer: Types.ObjectId,
    seller: Types.ObjectId,
    offerAmount: number,
    status: status,
    message?: string,
    expiredAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    cancelledAt: Date,
    
}


export interface IUser {
    name: string,
    email: string,
    password: string,
    role: UserRole,
    refreshToken?: string | null
}

export type OfferBody = {
    offerAmount: number,
    message: string,

}

export type OfferParam = {
    offerId: string
}

export type RespondOfferBody = {
    status: "accepted" | "rejected";
};

export type CancelOfferBody = {
    status: "canceled"
};

export type paymentStatus = "pending" | "success" | "failed"

export interface IPayment {
    user: Types.ObjectId,
    aircraft : Types.ObjectId,
    amount : number,
    status : paymentStatus,
    stripeSessionId: string
}