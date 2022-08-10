import { stripe } from "./";
import Stripe from "stripe";

// Creates a Stripe checkout session with line items
export async function createStripeCheckoutSession(
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[]
) {
  //Example item
  //{
  // name: 'T-Shirt',
  // description: 'Comfortable cotton t-shirt',
  // images: ['https://example.com/t-shirt.png'],
  // amount: 500, (500 cents = $5.00, stripe uses lowest value of currency),
  // currency: 'usd',
  // quantity: 1,
  //}
}
