import mongoose, { Schema, Document, Types } from "mongoose"
import type { IAircraft, engineType, aircraftType } from "../types/types.js"


const aircraftSchema = new Schema<IAircraft>({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  manufacturer: { type: String, required: true },  // Boeing, Airbus, Cessna
  model: { type: String, required: true },          // 737, A320
  year: { type: Number, required: true },
  price: { type: Number, required: true, min: 0 },
  aircraftType: {
    type: String,
    enum: ["commercial", "private", "cargo", "helicopter"],
    required: true,
    lowercase: true,
    trim: true
  },
  engineType: {
    type: String,
    enum: ["jet", "turboprop", "piston", "electric"],
    required: true,
    lowercase: true,
    trim: true
  },
  totalFlightHours: { type: Number, required: true },
  cruiseSpeed: { type: Number, required: true },    // km/h
  images: [{ type: String }],
  description: { type: String },
  isPremium: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  listingStatus: {
    type: String,
    enum: ["available", "under_offer", "sold"],
    default: "available",
  },

  acceptedOffer: {
    type: Types.ObjectId,
    ref: "Offer",
  },

  acceptedOfferPrice: Number,
  soldPrice: Number,
  soldAt: Date,

}, { timestamps: true })

export const Aircraft = mongoose.model<IAircraft>("Aircraft", aircraftSchema)