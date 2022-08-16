import express, { request, Request, Response, NextFunction } from "express";
//the app is the api (receives incoming requests
//and sends outbound responses)
export const app = express();

//by default, express handles the incoming body as a string
//can avoid parsing and decoding into JS on every request by
//setting up middleware that changes behavior of express
app.use(express.json());

//make api accessible to other urls (ex: frontend app when it
//starts making requests to this endpoint)
//cors = Cross Origin Resource Sharing
import cors from "cors";

app.use(cors({ origin: true }));

// Sets rawBody for webhook handling
//the reason we want a buffer is bc this is a signed request from stripe
app.use(
  express.json({
    verify: (req, res, buffer) => (req["rawBody"] = buffer),
  })
);

//testing the api
app.post("/test", (req: Request, res: Response) => {
  const amount = req.body.amount;

  res.status(200).send({ with_tax: amount * 7 });
});

import { createStripeCheckoutSession } from "./checkout";

//Checkouts
app.post(
  "/checkouts/",
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createStripeCheckoutSession(body.line_items));
  })
);

//catch async errors when awaiting promises
function runAsync(callback: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next);
  };
}

import { createPaymentIntent } from "./payments";
import { handleStripeWebhook } from "./webhooks";
import { auth } from "firebase-admin";

//Payment Intents API

//Create a PaymentIntent
app.post(
  "/payments",
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createPaymentIntent(body.amount));
  })
);

//Webhooks

//Handle Webhooks
app.post("/hooks", runAsync(handleStripeWebhook));

//Decodes the Firebase JSON Web Token
app.use(decodeJWT);
// Decodes the JSON web token sent via the frontend app
//Makes the currentUser (firebase) data available on the body
//This is used as middleware to intercept the incomnig request
//and modify it
async function decodeJWT(req: Request, res: Response, next: NextFunction) {
  if (req.headers?.authorization?.startsWith("Bearer")) {
    const idToken = req.headers.authorization.split("Bearer")[1];

    try {
      const decodedToken = await auth().verifyIdToken(idToken);
      req["currentUser"] = decodedToken;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}

//Validate User

//Throws and error if the currentUser does not exist on the request
function validateUser(req: Request) {
  const user = req["currentUser"];
  if (!user) {
    throw new Error(
      "You must be logged in to make this request. i.e. Authorization: Bearer <token>"
    );
  }
  return user;
}
