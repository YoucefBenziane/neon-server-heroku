/*
const stripe = require('stripe')('sk_live_d43r00imffQUpmXF4dfGcU3l00ejoGqOw9');
*/
const STRIPE_SDK = require('stripe');
const stripe = new STRIPE_SDK('pk_test_iTAEV0c6T5UukoNPkP6NqumX00YMdYAknS');
exports.create = function(token, email, amount) {
    const price = amount * 100;
    console.log(email)
    stripe.charges.create({
        amount: price, // in cents,
        currency: 'eur',
        source: token,
        metadata: {customer: email},
        description: email + ' Commande: ' + token,
    }, (err, charge) => {
        if(err) {
            return false
        } else {
            return true
        }
    })
/*    stripe.charges.create({
        amount: priceInPence,
        currency: 'eur',
        source: stripeToken,
        capture: true,
    }).then(chargeObject => {stripe.orders.create({
        currency: 'eur',
        email: 'jenny.rosen@example.com',
        items: [
            {type: 'sku', parent: 'sku_6z7JdULSnQVcEL'},
        ],
        shipping: {
            name: 'Jenny Rosen',
            address: {
                line1: '1234 Main Street',
                city: 'San Francisco',
                state: 'CA',
                country: 'US',
                postal_code: '94111',
            },
        },
    });
/!*
        makeOrderCreation(req, res, next, chargeObject)
*!/
    }).catch(error => {
        handleError(error);
    });*/
};

/*function makeOrderCreation(req, res, next, charge) {
    console.log('makeOrderCreation ', req.body)

    return

    stripe.pay(req, res, next).then(order => {
        res.status(200).json(order).end();
        stripe.charges.capture(charge.id)
            .then(res => res)
            .catch(err => err)
    }).catch((err) => {
    // we will refund the charge here
});*/

