"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import type { BillingInterval, PlanId } from "@/types/billing";

export const useCheckout = () => {
  return useMutation({
    mutationFn: async ({
      planId,
      billing,
    }: {
      planId: PlanId;
      billing: BillingInterval;
    }) => {
      const response = await axios.post("/api/stripe/checkout", {
        planId,
        billing,
      });

      return response.data;
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },

    onError: (error) => {
      console.log(error);
    },
  });
};
