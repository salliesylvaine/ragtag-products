import React, { useState, useEffect, Suspense } from "react";
import { fetchFromAPI } from "./helpers";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useUser, AuthCheck } from "reactfire";

import { db } from "./firebase";
import { SignIn, SignOut } from "./Customers";

//listens to the data in firestore in realtime for the login user
function UserData(props) {
  const [data, setData] = useState({});

  //Subscribe to the user's data in Firestore
  useEffect(() => {
    const unsubscribe = db
      .collection("users")
      .doc(props.user.uid)
      .onSnapshot((doc) => setData(doc.data()));
    return () => unsubscribe();
  }, [props.user]);

  return (
    <pre>
      Stripe Customer ID: {data.stripeCustomerId} <br />
      Subscriptions: {JSON.stringify(data.activePlans || [])}
    </pre>
  );
}

function SubscribeToPlan(props) {
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();

  const [plan, setPlan] = useState();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  //Get current subscriptions on mount
  useEffect(() => {
    getSubscriptions();
  }, [user]);

  //Fetch current subscription from the API
  const getSubscriptions = async () => {
    if (user) {
      const subs = await fetchFromAPI("subscriptions", { method: "GET" });
      setSubscriptions(subs);
    }
  };

  //Cancel a subscription
  const cancel = async (id) => {
    setLoading(true);
    await fetchFromAPI("subscriptions/" + id, { method: "PATCH" });
    alert("canceled!");
    await getSubscriptions();
    setLoading(false);
  };

  //Handle the submission of card details
  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();

    const CardElement = elements.getElement(CardElement);

    //Create a Payment Method
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: CardElement,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    //Create Subscription on the Server
    const subscription = await fetchFromAPI("subscriptions", {
      body: {
        plan,
        payment_method: paymentMethod.id,
      },
    });

    //The subscription contains an invoice
    //If the invoice's payment succeeded then you're good,
    //otherwise, the payment intent must be confirmed
    const { latest_invoice } = subscription;

    if (latest_invoice.payment_intent) {
      const { client_secret, status } = latest_invoice.payment_intent;

      //there's a chance that 3D verification needs to happen here
      if (status === "requires_action") {
        const { error: confirmationError } = await stripe.confirmCardPayment(
          client_secret
        );
        if (confirmationError) {
          console.error(confirmationError);
          alert("unable to confirm card");
          return;
        }
      }

      //success
      alert("You are subscribed!");
      getSubscriptions();
    }

    setLoading(false);
    setPlan(null);
  };

  return (
    <>
      <AuthCheck fallback={<SignIn />}>
        <div>{user?.uid && <UserData user={user} />}</div>

        <hr />

        <div>
          {/* hardcoding the plans since there's only two, in future might fetch from backend
    api if there are multiple plans or dynamic in any way */}
          <button onClick={() => setPlan("price_1LXrDUBUToEIWzMZ5BVmkzpd")}>
            Choose Monthly $25/m
          </button>
          <button onClick={() => setPlan("price_1LXrFVBUToEIWzMZy7fIcIFm")}>
            Choose Monthly $50/q
          </button>

          <p>
            Selected Plan: <strong>{plan}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} hidden={!plan}>
          <CardElement />
          <button type="submit" disabled={loading}>
            Subscribe and Pay
          </button>
        </form>

        <h3>Manage Current Subscriptions</h3>
        {subscriptions.map((sub) => (
          <div key={sub.id}>
            {sub.id}. Next payment of {sub.plan.amount} due{" "}
            {new Date(sub.current_period_end * 1000).toUTCString()}
            <button
              onClick={() => {
                cancel(sub.id);
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        ))}

        <div>
          <SignOut user={user} />
        </div>
      </AuthCheck>
    </>
  );
}

export default function Subscriptions() {
  return (
    <Suspense fallback={"loading user"}>
      <SubscribeToPlan />
    </Suspense>
  );
}
