import { getStripe } from "@/lib/stripe";
import { verifyToken } from "@/lib/verifyToken";
import { NextRequest, NextResponse } from "next/server";

type BillingInterval = "monthly" | "yearly";
type PlanId = "standard" | "enterprise";

const priceIds: Record<PlanId, Record<BillingInterval, string | undefined>> = {
  standard: {
    monthly: process.env.STRIPE_MONTHLY_STANDARD_PRICE_ID,
    yearly: process.env.STRIPE_YEARLY_STANDARD_PRICE_ID,
  },

  enterprise: {
    monthly: process.env.STRIPE_MONTHLY_ENTERPRISE_PRICE_ID,
    yearly: process.env.STRIPE_YEARLY_ENTERPRISE_PRICE_ID,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const planId = body.planId as PlanId;
    const billing = body.billing as BillingInterval;

    // Validate plan and billing
    if (
      (planId !== "standard" && planId !== "enterprise") ||
      (billing !== "monthly" && billing !== "yearly")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plan or billing interval",
        },
        { status: 400 },
      );
    }

    // Get authentication token
    const auth = await verifyToken();

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    const { userId } = auth;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token",
        },
        { status: 401 },
      );
    }

    // Get Stripe Price ID from server-side configuration
    const priceId = priceIds[planId][billing];

    if (!priceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe price is not configured for this plan",
        },
        { status: 500 },
      );
    }

    // Create Stripe Checkout Session
    const stripe = getStripe();

    const origin = req.nextUrl.origin;
console.log("Creating Stripe subscription checkout:", {
  planId,
  billing,
  priceId,
  mode: "subscription",
});
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url:
        `${origin}/products/payment` +
        `?checkout=success` +
        `&session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${origin}/products/payment` + `?checkout=cancelled`,

      metadata: {
        userId,
        planId,
        billing,
      },

      subscription_data: {
        metadata: {
          userId,
          planId,
          billing,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe did not return a checkout URL",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout session error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to start checkout",
      },
      { status: 500 },
    );
  }
}
