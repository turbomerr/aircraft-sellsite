import { Aircraft } from "../models/Aircraft.js"
import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/AppError.js"
import type{AircraftParams, aircraftType, engineType, AircraftBody} from "../types/types.js"


export const getAircrafts = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const aircraftList = await Aircraft.find().sort({ createdAt: -1 }); // en yeniyi getirir
        return res.status(200).json({
            length : aircraftList.length,
            results : aircraftList
        })
    } catch (error) {
        next(error)
    }

}

export const getAircraftsById = async (req: Request<AircraftParams>, res: Response, next: NextFunction) => {
    try {
        const { aircraftId } = req.params;
        const aircraft = await Aircraft.findById(aircraftId).populate("owner", "name email");
        if (!aircraft) {
            throw new AppError("Aircraft not found", 404);
        }
        return res.status(200).json({ aircraft })
    } catch (error) {
        next(error)
    }

}

export const createAircraft = async (req: Request<{}, {}, AircraftBody>, res: Response, next: NextFunction) => {

    try {
        const { manufacturer, model, year, price, aircraftType, engineType, totalFlightHours, cruiseSpeed, images, description } = req.body;

        if (
            !manufacturer ||
            !model ||
            !year ||
            !price ||
            !aircraftType ||
            !engineType ||
            !totalFlightHours ||
            !cruiseSpeed ||
            !images ||
            !description
        ) {
            throw new AppError("Please provide all required fields", 400);
        }

        if (!req.user) {
            throw new AppError("Not authorized", 401);
        }

        const newAircraft = await Aircraft.create({
            owner: req.user.userId,
            manufacturer: manufacturer.toLowerCase(),
            model: model.toLowerCase(),
            year,
            price,
            aircraftType: aircraftType.trim().toLowerCase() as aircraftType,
            engineType: engineType.trim().toLowerCase() as engineType,
            totalFlightHours,
            cruiseSpeed,
            images,
            description
        })
        await newAircraft.save();
        return res.status(201).json({
            message : "Aircraft created",
            newAircraft
        })

    }
    catch (error) {
        next(error)
    }
}

export const updateAircraft = async (req: Request<AircraftParams>, res: Response, next: NextFunction) => {

    try {
        const { aircraftId } = req.params;

        const aircraftOwner = await Aircraft.findById(aircraftId).populate("owner");
        const aircraftOwnerId = aircraftOwner?.owner._id.toString();

        if (aircraftOwnerId !== req.user?.userId) {
            throw new AppError("Not same user", 401)
        }
        const updateAircraft = await Aircraft.findByIdAndUpdate(aircraftId, { $set: req.body }, { new: true, runValidators: true });
        if (!updateAircraft) {
            throw new AppError("Aircraft not found", 404);
        }

        return res.status(200).json(updateAircraft)

    } catch (error) {
        next(error)
    }


}

export const deleteAircraft = async (req: Request<AircraftParams>, res: Response, next: NextFunction) => {
    try {
        const { aircraftId } = req.params;
        const aircraftOwner = await Aircraft.findById(aircraftId).populate("owner");
        const deleteAircraftOwnerId = aircraftOwner?.owner._id.toString();



        if (req.user?.userId !== deleteAircraftOwnerId) {
            throw new AppError("Not same user", 401)
        }

        const deletedAircraft = await Aircraft.findByIdAndDelete(aircraftId)

        if (!deletedAircraft) {
            throw new AppError("Aircraft not found", 404);
        }

        res.status(200).json({
            message: "Aircraft deleted successfully",
            aircraft: deletedAircraft,
        });

    } catch (error) {
        next(error)
    }


}