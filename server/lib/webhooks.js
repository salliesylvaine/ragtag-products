"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const _1 = require("./");
//Business logic for specific webhook event types
const webhookHandlers = {
    "payment_intent.succeeded": async (data) => {
        //add business logic here
    },
    "payment_intent.payment_failed": async (data) => {
        //add business logic here
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