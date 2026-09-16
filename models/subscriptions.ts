import { Schema, model, models } from "mongoose";

const subscriptionSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        period: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true,
        },

        start_date: {
            type: Date,
            default: Date.now,
            required: true,
        },

        end_date: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "canceled", "expired"],
            default: "active",
            required: true,
            index: true,
        },

        provider: {
            type: String,
            enum: ["stripe", "paypal"],
            default: "stripe",
            required: true,
        },

        provider_subscription_id: {
            type: String,
            index: true,
            sparse: true,
        },

        provider_customer_id: {
            type: String,
            index: true,
            sparse: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            default: "USD",
        },

        cancel_at_period_end: {
            type: Boolean,
            default: false,
        },

        canceled_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Subscription =
    models.Subscription ||
    model("Subscription", subscriptionSchema);