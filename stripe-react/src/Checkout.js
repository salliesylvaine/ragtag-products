import React, { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { fetchFromAPI } from "./helpers";

export function Checkout() {
  const stripe = useStripe();

  const [product, setProduct] = useState({
    name: "Hat",
    description: "Pug hat. A hat your pug will love.",
    images: [
      "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1587&q=80",
    ],
    amount: 799,
    currency: "usd",
    quantity: 0,
  });

  //method that takes product object and calculates next quantity based on current value
  const changeQuantity = (v) =>
    setProduct({ ...product, quantity: Math.max(0, product.quantity + v) });

  //async function that will make requests to api
  const handleClick = async (event) => {
    const body = { line_items: [product] };
    const { id: sessionId } = await fetchFromAPI("checkouts", {
      body,
    });

    //triggers actual checkout session
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
    if (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <h3>{product.name}</h3>
        <h4>Stripe Amount: {product.amount}</h4>

        <img src={product.images[0]} width="250px" alt="product" />
        <button onClick={() => changeQuantity(-1)}>-</button>
        <span>{product.quantity}</span>
      </div>

      <hr />

      {/* starts checkout session */}
      <button onClick={handleClick} disabled={product.quantity < 1}>
        Start Checkout
      </button>
    </>
  );
}

export function CheckoutFail() {
  return <h3>Checkout failed!</h3>;
}

export function CheckoutSuccess() {
  const url = window.location.href;
  const sessionId = new URL(url).searchParams.get("session_id");

  return <h3>Checkout was a success! {sessionId}</h3>;
}
