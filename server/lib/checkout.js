"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeCheckoutSession = void 0;
// Creates a Stripe checkout session with line items
async function createStripeCheckoutSession(line_items) {
    //Example item
    //{
    // name: 'T-Shirt',
    // description: 'Comfortable cotton t-shirt',
    // images: ['https://example.com/t-shirt.png'],
    // amount: 500, (500 cents = $5.00, stripe uses lowest value of currency),
    // currency: 'usd',
    // quantity: 1,
    //}
}
exports.createStripeCheckoutSession = createStripeCheckoutSession;
//# sourceMappingURL=checkout.js.map