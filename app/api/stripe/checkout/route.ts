import { getStripe } from "@/lib/stripe";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
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
    const plan = body.plan as PlanId;
    const billing = body.billing as BillingInterval;

    if (
      (plan !== "standard" && plan !== "enterprise") ||
      (billing !== "monthly" && billing !== "yearly")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid plan or billing interval" },
        { status: 400 },
      );
    }

    const token = (await cookies()).get("token")?.value;
    const jwtSecret = process.env.JWT_SECRET;

    if (!token || !jwtSecret) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId?: string };
    const userId = decoded.userId;
    const priceId = priceIds[plan][billing];

    if (!userId || !priceId) {
      return NextResponse.json(
        { success: false, message: "Checkout is not configured" },
        { status: 500 },
      );
    }

    const stripe = getStripe();
    const origin = req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/products/payment?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/payment?checkout=cancelled`,
      metadata: { userId, plan, billing },
      subscription_data: {
        metadata: { userId, plan, billing },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { success: false, message: "Stripe did not return a checkout URL" },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to start checkout" },
      { status: 500 },
    );
  }
}