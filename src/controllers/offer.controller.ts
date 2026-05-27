import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/AppError.js"
import type { AircraftParams } from "../types/types.js"
import { Aircraft } from "../models/Aircraft.js";
import { Offer } from "../models/Offer.js";
import type { OfferBody, OfferParam, RespondOfferBody, IAircraft, CancelOfferBody } from "../types/types.js"


export const createOffer = async (req: Request<AircraftParams, {}, OfferBody>, res: Response, next: NextFunction) => {

    try {
        const { aircraftId } = req.params;
        const { offerAmount, message } = req.body;

        if (!offerAmount || !message) {
            throw new AppError("Fields are missing", 400);
        }

        if (!req.user) {
            throw new AppError("You are not authenticated", 401);
        }
        if (!aircraftId) {
            throw new AppError("Aircraft Id not found", 404)
        }

        const aircraft = await Aircraft.findById(aircraftId);
        if (!aircraft) {
            throw new AppError("Aircraft not found", 404);
        }
        const aircraftID = aircraft._id;


        const sellerId = (await aircraft.populate("owner")).owner._id;
        const buyerId = req.user.userId;



        if (!sellerId) {
            throw new AppError("Seller owner id not found", 404);
        }

        //sellerAircraftOwnerId => ucagin sahibi 
        //req.user.userId = login yapmis, satin alacak kisi 

        // bu ikiside ayni ise hata ver
        if (sellerId.toString() === buyerId.toString()) {
            throw new AppError("Seller and buyer must be not same person", 400);
        }

        const existingOffer = await Offer.findOne({
            aircraft: aircraftID,
            buyer: buyerId,
            status: "pending",
        });

        if (existingOffer) {
            throw new AppError("You already have a pending offer for this aircraft", 400);
        }

        const offer = await Offer.create({
            aircraft: aircraftID,
            buyer: buyerId,
            seller: sellerId,
            offerAmount,
            message,
        })

        await offer.save();

        return res.status(201).json({
            message: "Offer created",
            buyerId,
            sellerId,
            offerAmount,
            offerMessage: message
        })

    } catch (error) {
        next(error)
    }
}

export const getMyOffers = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const myId = req.user?.userId

        if (!myId) {
            throw new AppError("User not authenticate", 404);
        }

        const myOffers = await Offer.find({
            buyer: myId
        })
            .populate("aircraft", "manufacturer model listingStatus")
            .populate("seller", "name")
            .populate("buyer", "name")
            .sort({ creadetAt: -1 })

        const pendingOfferList = myOffers.filter((offer) => offer.status === "pending")

        const acceptedOffersList = myOffers.filter((offer) => offer.status === "accepted")


        res.status(200).json({
            success: true,
            offersLength: myOffers.length,
            pendingOffers : pendingOfferList,
            acceptedOffers : acceptedOffersList
        });

    } catch (error) {
        next(error)
    }
}

export const getOffersMyAircraft = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const myId = req.user?.userId;

        if (!myId) {
            throw new AppError("User not authenticate", 404);
        }

        const receivedOffer = await Offer.find({ seller: myId }).populate("buyer", "name email ").populate("seller", "name email")
        console.log(receivedOffer)
        if (!receivedOffer) {
            throw new AppError("Received Offer not found", 404)
        }


        return res.status(200).json({
            message: "Received Offer List",
            results: receivedOffer.length,
            list: receivedOffer
        })

    } catch (error) {
        next(error)
    }
}

export const respondOffer = async (req: Request<OfferParam, {}, RespondOfferBody>, res: Response, next: NextFunction) => {

    try {

        const { offerId } = req.params;
        const { status } = req.body;

        if (!req.user) {
            throw new AppError("You are not authenticated", 401);
        }

        if (!["accepted", "rejected"].includes(status)) {
            throw new AppError("Action must be accepted or rejected", 400);
        }

        const offer = await Offer.findById(offerId).populate<{ aircraft: IAircraft }>("aircraft")

        if (!offer) {
            throw new AppError("Offer not found", 404);
        }
        if (offer.seller.toString() !== req.user.userId.toString()) {
            throw new AppError("You are not allowed to respond to this offer", 403);
        }

        if (offer.status !== "pending") {
            throw new AppError("Only pending offers can be responded to", 400);
        }

        if (offer.expiredAt <= new Date()) {
            offer.status = "expired";
            await offer.save();

            throw new AppError("This offer has expired", 400);
        }
        offer.status = status;

        if (offer.offerAmount >= offer.aircraft.price) {
            throw new AppError("Offer amount must be less than aircraft price", 400);
        }
        
        if (status === "accepted") {
            offer.acceptedAt = new Date();
            await Aircraft.findByIdAndUpdate(offer.aircraft, {
                $set: {
                    listingStatus: "under_offer",
                    acceptedOffer: offer._id,
                    acceptedOfferPrice: offer.offerAmount
                }

            }, { new: true })

            await Offer.updateMany({
                aircraft: offer.aircraft.owner._id,
                _id: { $ne: offer._id },
                status: "pending"
            },
                {
                    $set: {
                        status: "rejected",
                        rejectedAt: new Date()
                    }
                }

            )
        }
        if (status === "rejected") {
            offer.rejectedAt = new Date()
        }

        await offer.save();

        return res.status(200).json({
            message: `Offer status : ${status}`,
            offer
        })

    } catch (error) {
        next(error)
    }
}

export const cancelOffer = async (req: Request, res: Response, next: NextFunction) => {} // buyer icin 