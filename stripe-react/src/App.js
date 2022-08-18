import React from "react";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { Checkout, CheckoutSuccess, CheckoutFail } from "./Checkout";
import Payments from "./Payments";
import Customers from "./Customers";
import Subscriptions from "./Subscriptions";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul className="navbar-nav">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/checkout">
                <span aria-label="emoji" role="img">
                  🛒
                </span>{" "}
                Checkout
              </Link>
            </li>
            <li>
              <Link to="/payments">
                <span aria-label="emoji" role="img">
                  💸
                </span>{" "}
                Payments
              </Link>
            </li>
            <li>
              <Link to="/customers">
                <span aria-label="emoji" role="img">
                  🧑🏿‍🤝‍🧑🏻
                </span>{" "}
                Customers
              </Link>
            </li>
            <li>
              <Link to="/subscriptions">
                <span aria-label="emoji" role="img">
                  🔄
                </span>{" "}
                Subscriptions
              </Link>
            </li>
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/checkout" element={<Checkout />}></Route>
            <Route path="/payments" element={<Payments />}></Route>
            <Route path="/customers" element={<Customers />}></Route>
            <Route path="/subscriptions" element={<Subscriptions />}></Route>
            <Route path="/success" element={<CheckoutSuccess />}></Route>
            <Route path="/failed" element={<CheckoutFail />}></Route>
            <Route path="/" element={<Home />}></Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <>
      <h2>Stripe React + Node.js</h2>
    </>
  );
}

export default App;
