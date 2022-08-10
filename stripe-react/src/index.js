import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

//provider that allows us to access the react ui components in our react app
import { Elements } from "@stripe/react-stripe-js";
//automatically adds the stripe script tag to the head of the document
import { loadStripe } from "@stripe/stripe-js";

//asynchronously loads stripe and makes it available in the app
export const stripePromise = loadStripe(
  "pk_test_51LSQ7QBUToEIWzMZz1HTZKislRbLeluy1VXfH25NWk4pOH7RVM1HyoSQuqeZbgmNVdFAm1kIpTpGE2B3u8vdOtsj00XHvkbSMm"
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* makes stripe available globally throughout app */}
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
