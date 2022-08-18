import { stripe } from "./";
import Stripe from "stripe";
import { db } from "./firebase";
import { firestore } from "firebase-admin";

//Business logic for specific webhook event types

//Business logic for specific webhook event types
const webhookHandlers = {
  "checkout.session.completed": async (data: Stripe.Event.Data) => {
    //Add business logic here
  },
  "payment_intent.succeeded": async (data: Stripe.PaymentIntent) => {
    //add business logic here
  },
  "payment_intent.payment_failed": async (data: Stripe.PaymentIntent) => {
    //add business logic here
  },
  "customer.subscription.deleted": async (data: Stripe.Subscription) => {
    //Add your business logic here
  },
  "customer.subscription.created": async (data: Stripe.Subscription) => {
    const customer = (await stripe.customers.retrieve(
      data.customer as string
    )) as Stripe.Customer;
    const userId = customer.metadata.firebaseUID;
    const userRef = db.collection("users").doc(userId);

    await userRef.update({
      activePlans: firestore.FieldValue.arrayUnion(data.id),
    });
  },
  "invoice.payment_succeeded": async (data: Stripe.Invoice) => {
    //business logic
  },
  "invoice.payment_failed": async (data: Stripe.Invoice) => {
    //retrieve the full customer record from stripe, bc at this point, we have no idea
    //what the firebase userID is, but we save the firebase userID as metadata
    //on the stripe customer. that way we can access the corresponding firebase data from a webhook
    const customer = (await stripe.customers.retrieve(
      data.customer as string
    )) as Stripe.Customer;

    const userSnapshot = await db
      .collection("users")
      .doc(customer.metadata.firebaseUID)
      .get();
    //when an invoice payment fails, by default, stripe will try the charge a couple
    //times before it stops the collection of the payment. instead of canceling the
    //subscription immediately, you can update the status to 'past due'
    await userSnapshot.ref.update({ status: "PAST_DUE" });
  },
};

//Validate the stripe webhook secret,
//then call the handler for the event type
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  //construct all data to a JavaScript object
  const event = stripe.webhooks.constructEvent(
    req["rawBody"],
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  try {
    await webhookHandlers[event.type](event.data.object);
    res.send({ received: true });
  } catch (err) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
