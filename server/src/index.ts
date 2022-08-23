// Environment variables (Stripe API key)

import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") {
  config();
}

//Initialize Stripe
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET, {
  //@ts-ignore
  apiVersion: "2022-08-01",
});

//Start the API with Express
import { app } from "./api";
const port = process.env.PORT || 3333;
app.listen(port, () =>
  console.log(`API available on http://localhost:${port}`)
);
