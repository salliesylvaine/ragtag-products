"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const _1 = require("./");
const firebase_1 = require("./firebase");
const firebase_admin_1 = require("firebase-admin");
//Business logic for specific webhook event types
//Business logic for specific webhook event types
const webhookHandlers = {
    "checkout.session.completed": async (data) => {
        //Add business logic here
    },
    "payment_intent.succeeded": async (data) => {
        //add business logic here
    },
    "payment_intent.payment_failed": async (data) => {
        //add business logic here
    },
    "customer.subscription.deleted": async (data) => {
        //Add your business logic here
    },
    "customer.subscription.created": async (data) => {
        const customer = (await _1.stripe.customers.retrieve(data.customer));
        const userId = customer.metadata.firebaseUID;
        const userRef = firebase_1.db.collection("users").doc(userId);
        await userRef.update({
            activePlans: firebase_admin_1.firestore.FieldValue.arrayUnion(data.plan.id),
        });
    },
    "invoice.payment_succeeded": async (data) => {
        //business logic
    },
    "invoice.payment_failed": async (data) => {
        //retrieve the full customer record from stripe, bc at this point, we have no idea
        //what the firebase userID is, but we save the firebase userID as metadata
        //on the stripe customer. that way we can access the corresponding firebase data from a webhook
        const customer = (await _1.stripe.customers.retrieve(data.customer));
        const userSnapshot = await firebase_1.db
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
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    //construct all data to a JavaScript object
    const event = _1.stripe.webhooks.constructEvent(req["rawBody"], sig, process.env.STRIPE_WEBHOOK_SECRET);
    try {
        await webhookHandlers[event.type](event.data.object);
        res.send({ received: true });
    }
    catch (err) {
        console.error(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
//# sourceMappingURL=webhooks.js.map