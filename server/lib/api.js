"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
//the app is the api (receives incoming requests
//and sends outbound responses)
exports.app = express_1.default();
//by default, express handles the incoming body as a string
//can avoid parsing and decoding into JS on every request by
//setting up middleware that changes behavior of express
exports.app.use(express_1.default.json());
//make api accessible to other urls (ex: frontend app when it
//starts making requests to this endpoint)
//cors = Cross Origin Resource Sharing
const cors_1 = __importDefault(require("cors"));
exports.app.use(cors_1.default({ origin: true }));
// Sets rawBody for webhook handling
//the reason we want a buffer is bc this is a signed request from stripe
exports.app.use(express_1.default.json({
    verify: (req, res, buffer) => (req["rawBody"] = buffer),
}));
//testing the api
exports.app.post("/test", (req, res) => {
    const amount = req.body.amount;
    res.status(200).send({ with_tax: amount * 7 });
});
const checkout_1 = require("./checkout");
//Checkouts
exports.app.post("/checkouts/", runAsync(async ({ body }, res) => {
    res.send(await checkout_1.createStripeCheckoutSession(body.line_items));
}));
//catch async errors when awaiting promises
function runAsync(callback) {
    return (req, res, next) => {
        callback(req, res, next).catch(next);
    };
}
const payments_1 = require("./payments");
const webhooks_1 = require("./webhooks");
const firebase_admin_1 = require("firebase-admin");
const customers_1 = require("./customers");
//Payment Intents API
//Create a PaymentIntent
exports.app.post("/payments", runAsync(async ({ body }, res) => {
    res.send(await payments_1.createPaymentIntent(body.amount));
}));
//Webhooks
//Handle Webhooks
exports.app.post("/hooks", runAsync(webhooks_1.handleStripeWebhook));
//Decodes the Firebase JSON Web Token
exports.app.use(decodeJWT);
// Decodes the JSON web token sent via the frontend app
//Makes the currentUser (firebase) data available on the body
//This is used as middleware to intercept the incomnig request
//and modify it
async function decodeJWT(req, res, next) {
    var _a, _b;
    if ((_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.startsWith("Bearer")) {
        const idToken = req.headers.authorization.split("Bearer")[1];
        try {
            const decodedToken = await firebase_admin_1.auth().verifyIdToken(idToken);
            req["currentUser"] = decodedToken;
        }
        catch (err) {
            console.log(err);
        }
    }
    next();
}
//Validate User
//Throws and error if the currentUser does not exist on the request
function validateUser(req) {
    const user = req["currentUser"];
    if (!user) {
        throw new Error("You must be logged in to make this request. i.e. Authorization: Bearer <token>");
    }
    return user;
}
//Customer and Setup Intents
//Save a card on the customer record with a SetupIntent
exports.app.post("/wallet", runAsync(async (req, res) => {
    const user = validateUser(req);
    const setupIntent = await customers_1.createSetupIntent(user.uid);
    res.send(setupIntent);
}));
//Retrieve all cards attached to a customer
exports.app.get("/wallet", runAsync(async (req, res) => {
    const user = validateUser(req);
    const wallet = await customers_1.listPaymentMethods(user.uid);
    res.send(wallet.data);
}));
//# sourceMappingURL=api.js.map