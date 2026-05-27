import mongoose, { Schema, Types } from "mongoose"
import type { IOffer, status, IUser, IAircraft } from "../types/types.js"


const offerSchema = new Schema<IOffer>({
    aircraft: {
        type: Schema.Types.ObjectId,
        ref: "Aircraft",
        required: true
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    offerAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "cancelled", "expired"],
        default: "pending"
    },
    message: { type: String },
    expiredAt: {
        type: Date,
        required: true,
        default: function () {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
    },
    acceptedAt: {
        type :Date
    },
    rejectedAt: {
        type :Date
    },
    cancelledAt: {
        type :Date
    },
    
}, { timestamps: true })

export const Offer = mongoose.model<IOffer>("Offer", offerSchema);