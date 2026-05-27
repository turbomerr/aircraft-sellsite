import mongoose, { Schema } from "mongoose"
import type { IPayment } from "../types/types.js"

const paymentSchema = new Schema<IPayment>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    aircraft: {
        type: Schema.Types.ObjectId,
        ref: "Aircraft",
        required: true
    },
    amount: {
        type: Number,
        min: 0,
        required: true
    },
    currency: {
        type: String,
        default: "EUR",
        uppercase: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed", "cancelled"],
        default: "pending"
    },

    stripeSessionId: {
      type: String,
    },

    stripePaymentIntentId: {
      type: String,
    },

    paidAt: {
      type: Date,
    },
},{timestamps : true})

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);