import React, { useState, useEffect, Suspense } from "react";
import { fetchFromAPI } from "./helpers";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useUser, useSigninCheck } from "reactfire";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { SignIn, SignOut } from "./Customers";

//listens to the data in firestore in realtime for the login user
function UserData(props) {
  const [data, setData] = useState({});

  //Subscribe to the user's data in Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", props.user.uid), (doc) =>
      setData(doc.data())
    );
    // db
    //   .collection("users")
    //   .doc(props.user.uid)
    //   .onSnapshot((doc) => setData(doc.data()));
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
  const { data: signInCheckResult } = useSigninCheck();

  const [plan, setPlan] = useState();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  //Get current subscriptions on mount
  useEffect(() => {
    getSubscriptions();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const cardElement = elements.getElement(CardElement);

    //Create a Payment Method
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
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

  if (signInCheckResult?.signedIn === true) {
    return (
      <>
        <h2>Subscriptions</h2>
        <p>
          Subscribe a user to a recurring plan, process the payment, and sync
          with Firestore in realtime.
        </p>
        <div className="well">
          <h2>Firestore Data</h2>
          <p>User's data in Firestore.</p>
          {user?.uid && <UserData user={user} />}
        </div>

        <hr />

        <div className="well">
          <h3>Step 1: Choose a Plan</h3>
          {/* hardcoding the plans since there's only two, in future might fetch from backend
    api if there are multiple plans or dynamic in any way */}
          <button
            className={
              "btn " +
              (plan === "price_1LXrDUBUToEIWzMZ5BVmkzpd"
                ? "btn-primary"
                : "btn-outline-primary")
            }
            onClick={() => setPlan("price_1LXrDUBUToEIWzMZ5BVmkzpd")}
          >
            Choose Monthly $25/m
          </button>
          <button
            className={
              "btn " +
              (plan === "price_1LXrFVBUToEIWzMZy7fIcIFm"
                ? "btn-primary"
                : "btn-outline-primary")
            }
            onClick={() => setPlan("price_1LXrFVBUToEIWzMZy7fIcIFm")}
          >
            Choose Quarterly $50/q
          </button>

          <p>
            Selected Plan: <strong>{plan}</strong>
          </p>
        </div>
        <hr />

        <form className="well" onSubmit={handleSubmit} hidden={!plan}>
          <h3>Step 2: Submit a Payment Method</h3>
          <p>Collect credit card details</p>
          <p>
            Normal Card: <code>4242424242424242</code>
          </p>
          <p>
            3D Secure Card: <code>4000002500003155</code>
          </p>

          <hr />
          <CardElement />
          <button className="btn btn-success" type="submit" disabled={loading}>
            Subscribe and Pay
          </button>
        </form>

        <div className="well">
          <h3>Manage Current Subscriptions</h3>
          <div>
            {subscriptions.map((sub) => (
              <div key={sub.id}>
                {sub.id}. Next payment of {sub.plan.amount} due{" "}
                {new Date(sub.current_period_end * 1000).toUTCString()}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    cancel(sub.id);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="well">
          <SignOut user={user} />
        </div>
      </>
    );
  } else return <SignIn />;
}

export default function Subscriptions() {
  return (
    <Suspense fallback={"loading user"}>
      <SubscribeToPlan />
    </Suspense>
  );
}
