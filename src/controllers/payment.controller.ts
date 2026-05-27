import type { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../config/stripe.js";
import {Payment} from "../models/Payment.js";
import { Aircraft } from "../models/Aircraft.js";
import type { CheckoutParams } from "../types/types.js"
import { AppError } from "../utils/AppError.js";

export const createCheckoutSession = async (req: Request<CheckoutParams>, res: Response, next: NextFunction) => {
    try {
        const { aircraftId } = req.params;
        const userId = req.user?.userId;

        const aircraft = await Aircraft.findById(aircraftId);
        if (!aircraft) {
            throw new AppError("Aircraft not found", 404)
        }
        if (aircraft.owner._id.toString() !== userId?.toString()) {
            throw new AppError("You can only make your own aircraft premium", 403)
        }

        if (aircraft.isPremium) {
            throw new AppError("This aircraft is already premium", 400);
        }

        const premiumPrice: number = 2999;

        const payment = await Payment.create({
            user: userId,
            aircraft: aircraft._id,
            amount: premiumPrice / 100,
            currency: "eur",
            status: "pending"
        })


        const session = await stripe.checkout.sessions.create({
            mode: "payment",

            payment_method_types: ["card"],

            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Premium Listing - ${aircraft.manufacturer} ${aircraft.model}`,
                            description: "Make your aircraft listing premium.",
                        },
                        unit_amount: premiumPrice,
                    },
                    quantity: 1,
                },
            ],

            success_url: `${process.env.CLIENT_URL}/payment-success`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,

            metadata: {
                paymentId: payment._id.toString(),
                aircraftId: aircraft._id.toString(),
                userId: userId.toString(),
            },
        });

        payment.stripeSessionId = session.id;
        await payment.save();

        return res.status(200).json({
            success: true,
            checkoutUrl: session.url,
            sessionId: session.id,
        })
    } catch (error) {
        next(error)
    }
}

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error: any) {
        console.log("Webhook signature verification failed:", error.message);
        throw new AppError(`Webhook Error: ${error.message}`, 400)
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            const paymentId = session.metadata?.paymentId;
            const aircraftId = session.metadata?.aircraftId;

            if (!paymentId || !aircraftId) {
                throw new AppError("Missing paymentId or aircraftId in metadata", 400)
            }

            const payment = await Payment.findById(paymentId);

            if (!payment) {
                throw new AppError("Payment not found", 404)
            }

            if (payment.status === "success") {
                return res.status(200).json({
                    received: true,
                    message: "Payment already processed",
                });
            }

            await Payment.findByIdAndUpdate(paymentId, {
                $set: {
                    status: "success",
                    stripePaymentIntentId: session.payment_intent as string,
                    paidAt: new Date(),
                },
            });

            await Aircraft.findByIdAndUpdate(aircraftId, {
                $set: {
                    isPremium: true,
                },
            });

            console.log("Payment success. Aircraft premium activated.");
        }

        if (event.type === "checkout.session.expired") {
            const session = event.data.object as Stripe.Checkout.Session;

            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                await Payment.findByIdAndUpdate(paymentId, {
                    $set: {
                        status: "cancelled",
                    },
                });
            }
        }

        return res.status(200).json({
            received: true,
        });
    } catch (error) {
        next(error)
    }

};