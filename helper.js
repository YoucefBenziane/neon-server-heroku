const stripe = require('stripe')('sk_live_d43r00imffQUpmXF4dfGcU3l00ejoGqOw9');
//const stripe = require('stripe')('pk_test_iTAEV0c6T5UukoNPkP6NqumX00YMdYAknS');



exports.createCharge = function (amount, stripeToken) {
    const chargeData = getChargeData(amount, stripeToken);
    return stripe.charges.create(chargeData)
        .then(res => res)
        .catch(err => err)
};
function getChargeData (amount, stripeToken) {
    const amountInPence = amount * 100;
    return {
        amount: amountInPence,
        currency: 'usd',
        source: stripeToken,
        capture: true
    }
}
