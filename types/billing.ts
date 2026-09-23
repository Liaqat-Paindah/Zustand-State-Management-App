export type BillingInterval = "monthly" | "yearly";

export type PlanId = "standard" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
}