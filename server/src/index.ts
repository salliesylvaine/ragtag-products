// Environment variables (Stripe API key)

import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") {
  config();
}

//Initialize Stripe
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET, {
  // @ts-ignore
  apiVersion: "2020-03-02",
});
