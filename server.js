const express = require('express'),
    configdata = require('./config'),
    app = express()

const { DB_HOST, DB_USER, DB_NAME, DB_PASS, PORT } = configdata.envdata

app.use(express.json());
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: DB_HOST,
        user: DB_USER,
        database: DB_NAME,
        password: DB_PASS
    }
});
// console.log(DB_HOST, DB_USER, DB_NAME, DB_PASS, PORT);

// some response errors go here
module.exports = {
    error500: {
        "code": "USR_02",
        "message": "The field example is empty.",
        "field": "example",
        "status": 500
    },

    err400: {
        "error": {
            "status": 400,
            "code": "DEP_02",
            "message": "Don'exist department with this ID.",
            "field": "department_id"
        }
    },

    accessUnauth: {
        "error": {
            "status": 401,
            "code": "AUT_02",
            "message": "Access Unauthorized",
            "field": "NoAuth"
        }
    },

    emailsignup: {
        "error": {
            "status": 400,
            "code": "USR_04",
            "message": "The email already exist.",
            "field": "email"
        }
    },

    emaillogin: {
        "error": {
            "status": 400,
            "code": "USR_05",
            "message": "The email doesn't exist.",
            "field": "email"
        }
    }
}

// route to departments.js
var departments = express.Router();
require('./routes/departments')(departments, knex);
app.use('/departments', departments);

// route to category.js
var categories = express.Router();
require('./routes/category')(categories, knex);
app.use('/categories', categories);

// route to attributes.js
var attributes = express.Router();
require('./routes/attributes')(attributes, knex);
app.use('/attributes', attributes);

// route to products.js
var products = express.Router();
require('./routes/products')(products, knex);
app.use('/products', products);

// route to customers.js
var customers = express.Router();
require('./routes/customers')(customers, knex);
app.use('/customers', customers)

// route to orders.js
var orders = express.Router();
require('./routes/orders')(orders, knex);
app.use('/orders', orders)

// route to shoppingcart.js
var shoppingcart = express.Router();
require('./routes/shoppingcart')(shoppingcart, knex);
app.use('/shoppingcart', shoppingcart)

// route to tax.js
var tax = express.Router();
require('./routes/tax')(tax, knex);
app.use('/tax', tax)

// route to shipping.js
var shipping = express.Router();
require('./routes/shipping')(shipping, knex);
app.use('/shipping/regions', shipping)

// route to stripe.js
var stripe = express.Router();
require('./routes/stripe')(stripe, knex);
app.use('/stripe', stripe)

// the port listener
app.listen(PORT || 5000, () => {
    console.log(`your app is listening at ${PORT}`);
})