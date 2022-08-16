import { stripe } from "./";
import { db } from "./firebase";
import Stripe from "stripe";

//Gets the existing Stripe customer or creates a new record
export async function getOrCreateCustomer(
  userId: string,
  params?: Stripe.CustomerCreateParams
) {
  //retrieve the user's firestore document to see if a customer id exists there
  const userSnapshot = await db.collection("users").doc(userId).get();

  const { stripeCustomerId, email } = userSnapshot.data();

  //If missing customerID, create it
  if (!stripeCustomerId) {
    //CREATE new customer
    const customer = await stripe.customers.create({
      email,
      metadata: { firebaseUID: userId },
      ...params,
    });
    await userSnapshot.ref.update({ stripeCustomerId: customer.id });
    return customer;
  } else {
    return (await stripe.customers.retrieve(
      stripeCustomerId
    )) as Stripe.Customer;
  }
}
