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

//Payment Intents API

//Create a PaymentIntent
app.post(
  "/payments",
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createPaymentIntent(body.amount));
  })
);
