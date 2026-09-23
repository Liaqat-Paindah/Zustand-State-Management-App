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
    console.error("STRIPE_WEBHOOK_SECRET is missing");

    return NextResponse.json(
      {
        success: false,
        message: "STRIPE_WEBHOOK_SECRET is missing",
      },
      { status: 500 },
    );
  }

  // IMPORTANT:
  // Stripe signature verification requires the raw request body.
  const body = await req.text();

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Stripe signature not found");

    return NextResponse.json(
      {
        success: false,
        message: "Stripe signature not found",
      },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  // ---------------------------------------------------------
  // 1. Verify Stripe signature
  // ---------------------------------------------------------
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    console.log("Stripe event:", event.type);
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Invalid Stripe webhook signature",
      },
      { status: 400 },
    );
  }

  // ---------------------------------------------------------
  // 2. Process verified Stripe event
  // ---------------------------------------------------------
  try {
    await dbConnect();

    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        console.log("Checkout completed:", session.id);

        // Make sure this is a subscription checkout
        if (session.mode !== "subscription") {
          console.log(
            "Checkout is not a subscription:",
            session.mode,
          );
          break;
        }

        // ---------------------------------------------------
        // Stripe Customer ID
        // ---------------------------------------------------
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : null;

        // ---------------------------------------------------
        // Stripe Subscription ID
        // ---------------------------------------------------
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : null;

        if (!customerId || !subscriptionId) {
          console.error(
            "Missing Stripe customer or subscription ID:",
            {
              sessionId: session.id,
              customerId,
              subscriptionId,
            },
          );

          break;
        }

        // ---------------------------------------------------
        // Retrieve complete Stripe subscription
        // ---------------------------------------------------
        const stripeSubscription =
          await stripe.subscriptions.retrieve(
            subscriptionId,
          );

        console.log("Stripe subscription retrieved:", {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
        });

        // ---------------------------------------------------
        // Get userId from Checkout metadata
        // ---------------------------------------------------
        const userId = session.metadata?.userId;

        console.log(
          "Finding user for Stripe checkout:",
          {
            sessionId: session.id,
            userId: userId ?? null,
            email:
              session.customer_details?.email ?? null,
          },
        );

        let user;

        // First try MongoDB user ID
        if (userId) {
          user = await User.findById(userId);
        }

        // Fallback: find user by email
        if (!user && session.customer_details?.email) {
          user = await User.findOne({
            email:
              session.customer_details.email.toLowerCase(),
          });
        }

        if (!user) {
          console.error(
            "User not found for Stripe checkout:",
            session.id,
          );

          break;
        }

        // ---------------------------------------------------
        // Get Stripe subscription item
        // ---------------------------------------------------
        const subscriptionItem =
          stripeSubscription.items.data[0];

        if (!subscriptionItem) {
          throw new Error(
            "Stripe subscription item not found",
          );
        }

        // ---------------------------------------------------
        // Get Stripe price
        // ---------------------------------------------------
        const priceItem = subscriptionItem.price;

        if (!priceItem) {
          throw new Error(
            `No Stripe price found for subscription ${subscriptionId}`,
          );
        }

        const priceId = priceItem.id;

        // ---------------------------------------------------
        // Determine billing period
        // ---------------------------------------------------
        const period =
          priceItem.recurring?.interval === "year"
            ? "yearly"
            : "monthly";

        // ---------------------------------------------------
        // Subscription period dates
        // ---------------------------------------------------
        const startDate = new Date(
          subscriptionItem.current_period_start * 1000,
        );

        const endDate = new Date(
          subscriptionItem.current_period_end * 1000,
        );

        // ---------------------------------------------------
        // Stripe amount is stored in cents
        // ---------------------------------------------------
        const price =
          priceItem.unit_amount !== null
            ? priceItem.unit_amount / 100
            : 0;

        // ---------------------------------------------------
        // Save/update local subscription
        // ---------------------------------------------------
        const savedSubscription =
          await Subscription.findOneAndUpdate(
            {
              provider: "stripe",
              provider_subscription_id:
                stripeSubscription.id,
            },
            {
              user_id: user._id,
              period,
              start_date: startDate,
              end_date: endDate,

              status:
                stripeSubscription.status === "active"
                  ? "active"
                  : "inactive",

              provider: "stripe",
              provider_subscription_id:
                stripeSubscription.id,
              provider_customer_id: customerId,
              provider_price_id: priceId,
              provider_checkout_session_id: session.id,

              price,
              currency:
                priceItem.currency.toUpperCase(),

              cancel_at_period_end:
                stripeSubscription.cancel_at_period_end,

              canceled_at:
                stripeSubscription.canceled_at
                  ? new Date(
                      stripeSubscription.canceled_at *
                        1000,
                    )
                  : null,
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
            },
          );

        console.log(
          "Subscription created/updated:",
          {
            id: savedSubscription?._id.toString(),
            stripeSubscriptionId:
              stripeSubscription.id,
            userId: user._id.toString(),
          },
        );

        break;
      }

      default:
        console.log(
          `Unhandled Stripe event: ${event.type}`,
        );
    }

    return NextResponse.json({
      success: true,
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook processing error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
