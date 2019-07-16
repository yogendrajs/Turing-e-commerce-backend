// Everything about customers
var error = require('../server');
const jwt = require('jsonwebtoken');
const configdata = require('../config')
const checkToken = require('../middleware')

module.exports = function(customers, knex){

    // for signing up for new user
    customers.post('/', (req, res) => {
        const {body} = req;
        const {name, email, password} = body;
        
        knex
        .select('email', 'password')
        .from('customer')
        .where('customer.email', email)
        .andWhere('customer.password', password)
        .then((data) => {

            if (data.length == 0){
                knex
                .insert(body)
                .into('customer')
                .then((data) => {
                    jwt.sign(body, configdata.secretkey, { expiresIn: '1h' }, (err, token) => {
                        if (err){
                            return res.send(err);
                        }
                        knex
                        .select(
                            'customer_id',
                            'name',
                            'email',
                            'address_1',
                            'address_2',
                            'city',
                            'region',
                            'postal_code',
                            'shipping_region_id',
                            'credit_card',
                            'day_phone',
                            'eve_phone',
                            'mob_phone'
                        )
                        .from('customer')
                        .where('customer.email', email)
                        .then((data) => {
                            responseData = {
                                'customer': data[0],
                                'accessToken': 'Bearer ' + token,
                                'expires_in': '1h'
                            }
                            console.log('data sent');
                            return res.json(responseData);
                        })
                    })

                }).catch((err) => {
                    console.log('error in your jwt token', err);
                    res.json('error');
                })
            }
            else {
                console.log('this user is already registered!')
                res.json('this user is already registered!');
            }
        })
        .catch((error) => {
            console.log(error.emailsignup);
        })
    })

    // for signing in for existing user
    customers.post('/login', (req, res) => {
        const {body} = req;
        const {email, password} = body;

        knex
        .select('customer.email', 'customer.password')
        .from('customer')
        .where('customer.email', email)
        .andWhere('customer.password', password)
        .then((data) => {

            if (data.length > 0){
                jwt.sign(body, configdata.secretkey, { expiresIn: '1h' }, (err, token) => {
                    if (err){
                        return res.send(err);
                    }
                    knex
                    .select(
                        'customer_id',
                        'name',
                        'email',
                        'address_1',
                        'address_2',
                        'city',
                        'region',
                        'postal_code',
                        'shipping_region_id',
                        'credit_card',
                        'day_phone',
                        'eve_phone',
                        'mob_phone'
                    )
                    .from('customer')
                    .where('customer.email', email)
                    .then((data) => {
                        responseData = {
                            'customer': data[0],
                            'accessToken': 'Bearer ' + token,
                            'expires_in': '1h'
                        }
                        console.log('data sent');
                        return res.json(responseData);
                    })
                })
            }
            else {
                console.log('this user doesn\'t exist. Please sign up!');
                res.json(error.emaillogin);
            }
        })
        .catch((error) => {
            console.log(error);
            return res.json('error sent!');
        })
    })

    // update a customer
    customers.put('/', checkToken, (req, res) => {
        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err) {
                
                const {body} = req;
                const {
                    name,
                    email,
                    password,
                    day_phone, 
                    eve_phone,
                    mob_phone,
                } = body;

                knex('customer')
                .update({
                        'name': name,
                        'email': email,
                        'password': password,
                        'day_phone': day_phone, 
                        'eve_phone': eve_phone,
                        'mob_phone': mob_phone,
                    })
                .where('customer.email', authData.email)
                .then(() => {
                    console.log('customer updated!');
                    return res.json({customerUpdate: 'customer updated!'});
                })
                .catch((err) => {
                    console.log(err);
                    return res.send({error: 'error sent to console! :D'});
                })
            } 
            else {
                console.log({error_name: err.message, tokenExpiredAt: err.expiredAt});
                return res.sendStatus(403)
            }
        })
    })

    // to update the address of the customer
    customers.put('/address', checkToken, (req, res) => {
        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err) {
                
                const {body} = req;
                const {
                    address_1,
                    address_2,
                    city,
                    region, 
                    postal_code,
                    country,
                    shipping_region_id
                } = body;

                knex('customer')
                .update({
                        'address_1': address_1,
                        'address_2': address_2,
                        'city': city,
                        'region': region, 
                        'postal_code': postal_code,
                        'country': country,
                        'shipping_region_id': shipping_region_id
                    })
                .where('customer.email', authData.email)
                .then(() => {
                    console.log('address updated!');
                    return res.json({customerAddUpdate: 'customer updated!'});                    
                })
                .catch((err) => {
                    console.log(err);
                    return res.send({error: 'error sent to console! :D'});                    
                })
            } 
            else {
                console.log({error_name: err.message, tokenExpiredAt: err.expiredAt});
                return res.sendStatus(403)
            }
        })
    })

    // to update the customer's credit card
    customers.put('/creditCard', checkToken, (req, res) => {
        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err){
                const {body} = req;
                const {credit_card} = body;

                knex('customer')
                .update('customer.credit_card', credit_card)
                .where('customer.email', authData.email)
                .then(() => {
                    console.log('credit card detail updated!');
                    return res.json({creditCardUpdate: 'credit card updated!'});
                })
                .catch((err) => {
                    console.log(err);
                    return res.send({error: 'error sent to console! :D'});
                })
            }
            else {
                console.log({error_name: err.message, tokenExpiredAt: err.expiredAt});
                return res.sendStatus(403);
            }
        })
    })

    // get a customer by its token (user-key)
    customers.get('/', checkToken, (req, res) => {
        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err){
                knex
                .select('*')
                .from('customer')
                .where('customer.email', authData.email)
                .then((data) => {
                    console.log('data by token sent!');
                    return res.send(data);
                })
                .catch((err) => {
                    console.log(err);
                    return res.send(error.accessUnauth)
                })
            }
            else{
                console.log({error_name: err.message, tokenExpiredAt: err.expiredAt});
                return res.sendStatus(403);
            }
        })
    })
}
