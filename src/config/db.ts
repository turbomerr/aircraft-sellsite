import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    console.log("Connecting to database...");

    if (!process.env.MONGO_URI) {
      throw new Error("Mongo URI is missing!");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Database connected!");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};