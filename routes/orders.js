// Everything about orders
var error = require('../server');
const checkToken = require('../middleware');
const jwt = require('jsonwebtoken');
const configdata = require('../config')

module.exports = function(orders, knex) {
    // create an order
    orders.post('/', checkToken, (req, res) => {
        let { body } = req;
        let { cart_id, shipping_id, tax_id } = body;
        // verifying jwt-token
        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err) {
                knex('customer')
                    .where('customer.email', authData.email)
                    .then((customer_data) => {

                        knex('shopping_cart')
                            .join('product', function() {
                                this.on('shopping_cart.product_id', 'product.product_id')
                            })
                            .where('shopping_cart.cart_id', cart_id)
                            .then((shopping_cart_data) => {
                                totalOfCart = shopping_cart_data.map(unitData => unitData.price * unitData.quantity).reduce((a, b) => a + b, 0)
                                console.log(totalOfCart);

                                knex('orders')
                                    .insert({
                                        'total_amount': totalOfCart,
                                        'created_on': new Date(),
                                        'customer_id': customer_data[0].customer_id,
                                        'shipping_id': shipping_id,
                                        'tax_id': tax_id
                                    })
                                    .then(() => {

                                        knex('shopping_cart')
                                            .where('shopping_cart.cart_id', cart_id)
                                            .del()
                                            .then(() => {

                                                knex('orders')
                                                    .then((orders_data) => {

                                                        shopping_cart_data.map(eachItem => {
                                                            return (
                                                                knex('order_detail')
                                                                .insert({
                                                                    'order_id': orders_data[orders_data.length - 1].order_id,
                                                                    'product_id': eachItem.product_id,
                                                                    'attributes': eachItem.attributes,
                                                                    'product_name': eachItem.name,
                                                                    'quantity': eachItem.quantity,
                                                                    'unit_cost': eachItem.price
                                                                })
                                                                .then(() => {
                                                                    console.log();
                                                                })
                                                                .catch((err) => {
                                                                    console.log(err);
                                                                })
                                                            )
                                                        })

                                                        return res.json({ order_id: orders_data[orders_data.length - 1].order_id });
                                                    })
                                                    .catch((err) => {
                                                        console.log(err);
                                                    })
                                            })
                                            .catch((err) => {
                                                console.log(err);
                                            })
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            } else {
                console.log({ error_name: err.message, tokenExpiredAt: err.expiredAt });
                return res.sendStatus(403);
            }
        })
    })

    // get orders by customer
    orders.get('/inCustomer', checkToken, (req, res) => {
        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err) {
                knex
                    .select(
                        'order_id',
                        'total_amount',
                        'created_on',
                        'shipped_on',
                        'status',
                        'name'
                    )
                    .from('orders')
                    .join('customer', function() {
                        this.on('orders.customer_id', 'customer.customer_id')
                    })
                    .where('customer.email', authData.email)
                    .then((data) => {
                        console.log('fetched required data for the customer!');
                        return res.json(data);
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json({ err: 'error finding required data!' });
                    })
            } else {
                console.log({ error_name: err.message, tokenExpiredAt: err.expiredAt });
                return res.sendStatus(403);
            }
        })
    })

    // get info about order by order_id
    orders.get('/:order_id', checkToken, (req, res) => {
        let order_id = req.params.order_id;

        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err) {
                knex
                    .select(
                        'order_id',
                        'product_id',
                        'attributes',
                        'product_name',
                        'quantity',
                        'unit_cost'
                    )
                    .from('order_detail')
                    .where('order_detail.order_id', order_id)
                    .then((data) => {

                        data.map(allData => allData.subtotal = parseFloat((allData.quantity * allData.unit_cost).toFixed(2)))

                        console.log('data by order id sent!');
                        return res.json(data);
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json(error.error500);
                    })
            } else {
                console.log({ error_name: err.message, tokenExpiredAt: err.expiredAt });
                return res.sendStatus(403);
            }
        })
    })

    // get info about order (short detail)
    // The person can view anyone's shortDetail by the order_id
    orders.get('/shortDetail/:order_id', checkToken, (req, res) => {
        let order_id = req.params.order_id;

        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err) {
                knex
                    .select(
                        'order_id',
                        'total_amount',
                        'created_on',
                        'shipped_on',
                        'status',
                        'name'
                    )
                    .from('orders')
                    .join('customer', function() {
                        this.on('orders.customer_id', 'customer.customer_id')
                    })
                    .where('orders.order_id', order_id)
                    .then((data) => {
                        console.log('fetched required data by order_id!');
                        return res.json(data);
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json({ err: 'error finding required data!' });
                    })
            } else {
                console.log({ error_name: err.message, tokenExpiredAt: err.expiredAt });
                return res.sendStatus(403);
            }
        })
    })
}