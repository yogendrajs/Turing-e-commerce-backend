// Everthing about Stripe Integration and Webhooks (https://stripe.com/)
let error = require('../server');

module.exports = function(stripe, knex) {
    // require stripe with stripe secret key
    const stripeAPI = require("stripe")(process.env.STRIPE_SECRET_KEY);
    // to find the token of your stripe id
    stripe.post('/token', (req, res) => {
        let { body } = req;
        let { number, exp_month, exp_year, cvc } = body;

        stripeAPI.tokens.create({
            card: {
                number: number,
                exp_month: exp_month,
                exp_year: exp_year,
                cvc: cvc
            }
        }, function(err, token) {
            // asynchronously called
            if (!err) {
                console.log('token sent!');
                return res.json({ token: token })
            } else {
                console.log(err);
                return res.json(error.error500)
            }
        });
    })

    // to create a charge
    stripe.post('/charge', (req, res) => {
        let { body } = req;
        let { stripeToken, order_id, description, amount, currency } = body;

        stripeAPI.charges.create({
            amount: amount,
            currency: currency,
            description: description,
            source: stripeToken
                // order: order_id
        }, (err, charge) => {
            // asynchronously called
            if (err) {
                return res.json({
                    'err': err,
                    'Success': false,
                    'Message': 'Payment failed!'
                })
            } else {
                return res.json({
                    'charge': charge,
                    'Success': true,
                    'Message': 'Payment success!'
                })
            }
        })
    })

    // Endpoint that provide a synchronization
    stripe.post('/webhooks', (req, res) => {
        // stripe Webhooks
        stripeAPI.webhookEndpoints.create({
            url: "https://8727c679.ngrok.io/stripe/webhooks",
            enabled_events: ["charge.failed", "charge.succeeded"]
        }, function(err, webhookEndpoint) {
            // asynchronously called
            if (!err) {
                return res.json({
                    'received': true,
                    'webhookEndpoint': webhookEndpoint
                })
            }
            return res.json({
                'received': false,
                'err': err
            })
        })
    })
}