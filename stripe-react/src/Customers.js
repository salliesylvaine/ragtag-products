import React, { useState, useEffect, Suspense } from "react";
import { fetchFromAPI } from "./helpers";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useUser, useSigninCheck } from "reactfire";
// import firebase from "firebase/compat/app";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

///// Sign In and Sign Out /////

export function SignIn() {
  const signIn = async () => {
    //sign in with google using firebase
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const { uid, email } = credential.user;
    setDoc(doc(db, "users", uid), { email }, { merge: true });
    // db.collection("users").doc(uid).set({ email }, { merge: true });
  };
  return (
    <button className="btn btn-primary" onClick={signIn}>
      Sign In with Google
    </button>
  );
}

export function SignOut(props) {
  return (
    props.user && (
      <button
        className="btn btn-outline-secondary"
        onClick={() => signOut(auth)}
      >
        Sign Out User {props.user.uid}
      </button>
    )
  );
}

function SaveCard(props) {
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();
  const { data: signInCheckResult } = useSigninCheck();

  const [setupIntent, setSetupIntent] = useState();
  const [wallet, setWallet] = useState([]);

  //Get the user's wallet on mount
  useEffect(() => {
    getWallet();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  //Create the setup intent
  const createSetupIntent = async (event) => {
    const si = await fetchFromAPI("wallet");
    setSetupIntent(si);
  };

  const getWallet = async () => {
    if (user) {
      const paymentMethods = await fetchFromAPI("wallet", { method: "GET" });
      setWallet(paymentMethods);
    }
  };

  //Handle the submission of card details
  const handleSubmit = async (event) => {
    event.preventDefault();

    const cardElement = elements.getElement(CardElement);

    //Confirm Card Setup
    const { setupIntent: updatedSetupIntent, error } =
      await stripe.confirmCardSetup(setupIntent.client_secret, {
        payment_method: { card: cardElement },
      });

    if (error) {
      alert(error.message);
      console.log(error);
    } else {
      setSetupIntent(updatedSetupIntent);
      await getWallet();
      alert("Success! Card added to your wallet");
    }
  };

  if (signInCheckResult?.signedIn === true) {
    return (
      <>
        <h2>Customers</h2>

        <p>
          Save credit card details for future use. Connect a Stripe ID to a
          Firebase User ID
        </p>

        {/* <AuthCheck fallback={<SignIn />}> */}
        <div className="well">
          <h3>Step 1: Create a Setup Intent</h3>
          <button
            className="btn btn-success"
            onClick={createSetupIntent}
            hidden={setupIntent}
          >
            Attach New Credit Card
          </button>
        </div>
        <hr />

        <form
          onSubmit={handleSubmit}
          className="well"
          hidden={!setupIntent || setupIntent.status === "succeeded"}
        >
          <h3>Step 2: Submit a Payment Method</h3>
          <p>Collect credit card details, then attach the payment source.</p>
          <p>
            Normal Card: <code>4242424242424242</code>
          </p>
          <p>
            3D Secure Card: <code>4000002500003155</code>
          </p>
          <hr />

          <CardElement />
          <button className="btn btn-success" type="submit">
            Attach
          </button>
        </form>

        <div className="well">
          <h3>Retrieve All Payment Sources</h3>
          <select className="form-control">
            {wallet.map((paymentSource) => (
              <CreditCard key={paymentSource.id} card={paymentSource.card} />
            ))}
          </select>
        </div>

        <div className="well">
          <SignOut user={user} />
        </div>
        {/* </AuthCheck> */}
      </>
    );
  } else return <SignIn />;
}

function CreditCard(props) {
  const { last4, brand, exp_month, exp_year } = props.card;
  return (
    <option>
      {brand} **** **** **** {last4} expires {exp_month}/{exp_year}
    </option>
  );
}

//the Reactfire library uses React Suspense under the hood.
//in order for this component to work properly, we need to
//add a suspense component as its parent
export default function Customers() {
  return (
    <Suspense fallback={"loading user"}>
      <SaveCard />
    </Suspense>
  );
}
