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
//testing the api
exports.app.post("/test", (req, res) => {
    const amount = req.body.amount;
    res.status(200).send({ with_tax: amount * 7 });
});
//# sourceMappingURL=api.js.map