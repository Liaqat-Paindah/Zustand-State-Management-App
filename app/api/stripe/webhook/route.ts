import dbConnect from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { Subscription } from "@/models/subscriptions";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  console.log("Stripe webhook request received");

  const stripe = getStripe();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      {
        success: false,
        message: "STRIPE_WEBHOOK_SECRET is missing",
      },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        message: "Stripe signature not found",
      },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid Stripe webhook signature",
      },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    switch (event.type) {
      /**
       * Checkout completed
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout completed:", session.id);
        if (session.mode !== "subscription") {
          break;
        }
        const customerId = session.customer as string ;
        const subscriptionId =     session.subscription as string;

        if (!customerId || !subscriptionId) {
          console.error("Missing Stripe customer or subscription ID");
          break;
        }
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        await stripe.customers.retrieve(customerId);

        const userId = session.metadata?.userId;

        let user;

        if (userId) {
          user = await User.findById(userId);
        }

        /**
         * Fallback: find by email
         */
        if (!user && session.customer_details?.email) {
          user = await User.findOne({
            email: session.customer_details.email.toLowerCase(),
          });
        }

        if (!user) {
          console.error("User not found for Stripe checkout:", session.id);

          break;
        }

        /**
         * Get the Stripe price
         */
        const priceItem = stripeSubscription.items.data[0]?.price;

        if (!priceItem) {
          console.error("No Stripe price found:", subscriptionId);

          break;
        }

        const priceId = priceItem.id;

        /**
         * Determine monthly/yearly period
         */
        const period =
          priceItem.recurring?.interval === "year" ? "yearly" : "monthly";

        /**
         * Stripe timestamps are Unix timestamps in seconds
         */

        const subscriptionItem = stripeSubscription.items.data[0];

        if (!subscriptionItem) {
          throw new Error("Subscription item not found");
        }

        const startDate = new Date(
          subscriptionItem.current_period_start * 1000,
        );


        const endDate = new Date(subscriptionItem.current_period_end * 1000);

        /**
         * Stripe amount is stored in cents
         */
        const price =
          priceItem.unit_amount !== null ? priceItem.unit_amount / 100 : 0;

        /**
         * Create/update local subscription
         */
        await Subscription.findOneAndUpdate(
          {
            provider: "stripe",
            provider_subscription_id: stripeSubscription.id,
          },
          {
            user_id: user._id,
            period,
            start_date: startDate,
            end_date: endDate,
            status:
              stripeSubscription.status === "active" ? "active" : "inactive",

            provider: "stripe",

            provider_subscription_id: stripeSubscription.id,

            provider_customer_id: customerId,

            provider_price_id: priceId,

            provider_checkout_session_id: session.id,

            price,

            currency: priceItem.currency.toUpperCase(),

            cancel_at_period_end: stripeSubscription.cancel_at_period_end,

            canceled_at: stripeSubscription.canceled_at
              ? new Date(stripeSubscription.canceled_at * 1000)
              : null,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );

        console.log("Subscription created/updated:", stripeSubscription.id);

        break;
      }
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({
      success: true,
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
