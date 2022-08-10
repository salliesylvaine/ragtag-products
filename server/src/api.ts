import express, { Request, Response } from "express";
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
