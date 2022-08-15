import React, { useState } from "react";
import { fetchFromAPI } from "./helpers";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

function Payments() {
  const stripe = useStripe();
  //imports card element, a prebuilt component that handles credit card input
  const elements = useElements();

  //amount user wants to pay
  const [amount, setAmount] = useState(0);

  //actual response we get from the API with the payment intent opbject
  const [paymentIntent, setPaymentIntent] = useState();

  //Create a payment intent on the server
  const createPaymentIntent = async (event) => {
    //Clamp amount to Stripe min/max
    const validAmount = Math.min(Math.max(amount, 50), 9999999);
    setAmount(validAmount);

    //Make the API request
    const pi = await fetchFromAPI("payments", {
      body: { amount: validAmount },
    });
    setPaymentIntent(pi);

    //Handle the submission of card details
    const handleSubmit = async (event) => {
      event.preventDefault();

      const cardElement = elements.getElement(CardElement);

      //Confirm Card Payment
      const { paymentIntent: updatedPaymentIntent, error } =
        await stripe.confirmedCardPayment(paymentIntent.client_secret, {
          payment_method: { card: cardElement },
          //tells stripe to take the credit card and apply it to the payment intent,
          //which it will try to charge right away
        });
      if (error) {
        console.error(error);
        error.payment_intent && setPaymentIntent(error.payment_intent);
      } else {
        setPaymentIntent(updatedPaymentIntent);
      }
    };
  

  return (
    <>
      <div>
        <input
          type="number"
          value={amount}
          disabled={paymentIntent}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          disabled={amount <= 0}
          onClick={createPaymentIntent}
          hidden={paymentIntent}
        >
          Ready to Pay ${(amount / 100).toFixed(2)}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit">Pay</button>
      </form>
    </>
  );
}
