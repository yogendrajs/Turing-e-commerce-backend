// Everything about products
var error = require('../server');
const checkToken = require('../middleware');
const jwt = require('jsonwebtoken');
const configdata = require('../config')

module.exports = function(products, knex){
    // to get all the products
    products.get('/', (req, res) => {
        knex
        .select(
            'product_id', 
            'name', 
            'description', 
            'price', 
            'discounted_price', 
            'thumbnail'
            )
        .from('product')
        .then((data) => {
            var wholeData = {
                count: data.length,
                rows: data
            }
            res.json(wholeData);
        })
        .catch((err) => {
            res.send(error.error500);
            console.log('there is an in your sql query');
        })
    })

    // to search for a product
    products.get('/search', (req, res) => {
        // console.log(req.query.pro);
        let sql = req.query.pro;
        knex
        .select(
            'product_id',
            'name',
            'description',
            'price',
            'discounted_price',
            'thumbnail'
        )
        .from('product')
        .where('name','like','% '  + sql)
        .orWhere('name','like', sql + ' %')
        .orWhere('description','like','%' + sql + '%')
        .orWhere('name',sql)
        .then((data) => {
            console.log('data sent by search!');
            return res.json(data);
        })
        .catch((err) => {
            console.log(err)
            return res.json(err);
        })
    })

    // to get a product by product id
    products.get('/:product_id', (req, res) => {
        knex
        .select('*')
        .from('product')
        .where('product.product_id', req.params.product_id)
        .then((data) => {
            res.json(data[0]);
        })
        .catch((err) => {
            res.send(error.error500);
            console.log('there is an in your sql query');
        })
    })

    // to get a list of products of categories by category id
    products.get('/inCategory/:category_id', (req, res) => {
        knex
        .select(
            'product.product_id', 
            'product_category.category_id', 
            'product.name', 
            'product.description', 
            'product.price', 
            'product.discounted_price', 
            'product.thumbnail'
            )
        .from('product')
        .join('product_category', function(){
            this.on('product.product_id', 'product_category.product_id')
        }).where('product_category.category_id', req.params.category_id)
        .then((datafromtable) => {
            let data = {
                count: datafromtable.length,
                rows: datafromtable
            }
            if (datafromtable.length != 0){
                console.log('success')
                return res.json(data);
            }
            return res.json(error.error500);
        })
        .catch((err) => {
            res.json(error.error500);
            console.log('there is an in your sql query');
        })
    })

    // to get a list of products of departments by department id
    products.get('/inDepartment/:department_id', (req, res) => {
        knex
        .select(
            'product.product_id',
            'product.name',
            'product.description', 
            'product.price', 
            'product.discounted_price', 
            'product.thumbnail', 
            'product.display'
         )
        .from('product')
        .join('product_category', function(){
            this.on('product.product_id', 'product_category.product_id')
        }).join('category', function(){
            this.on('product_category.category_id', 'category.category_id')
        }).where('category.department_id', req.params.department_id)
        .then((knexdata) => {
            let data = {
                count: knexdata.length,
                rows: knexdata
            }
            res.json(data);
            console.log('success reading product by department id');
        })
        .catch((err) => {
            res.json(error.error500);
            console.log('there is an in your sql query');
        })
    })

    // to get details of a product
    products.get('/:product_id/details', (req, res) => {
        knex
        .select(
            'product.product_id',
            'product.name',
            'product.description', 
            'product.price', 
            'product.discounted_price', 
            'product.thumbnail', 
            'product.display'
        )
        .from('product')
        .join('product_category', function(){
            this.on('product.product_id', 'product_category.product_id')
        })
        .join('category', function(){
            this.on('product_category.category_id', 'category.category_id')
        })
        .where('product.product_id', req.params.product_id)
        .then((data) => {
            res.json(data);
            console.log('success reading product by department id');
        })
        .catch((err) => {
            res.json(error.error500);
            console.log('there is an in your sql query');
        })
    })

    // to get locations of a product
    products.get('/:product_id/locations', (req, res) => {
        knex
        .select(
            'category.category_id',
            'category.name as category_name',
            'department.department_id',
            'department.name as department_name'
        )
        .from('category')
        .join('product_category', function(){
            this.on('category.category_id', 'product_category.category_id')
        })
        .join('department', function(){
            this.on('department.department_id', 'category.department_id')
        })
        .where('product_category.product_id', req.params.product_id)
        .then((data) => {
            res.send(data);
            console.log('success reading data by product locations');
        })
        .catch((err) => {
            res.send(error.error500);
            console.log('there is an error in your sql syntax');
        })
    })

    // to get all the reviews of a product using product_id
    products.get('/:product_id/reviews', (req, res) => {
        knex
        .select(
            'name',
            'review',
            'rating',
            'created_on'
        )
        .from('review')
        .where('review.product_id', req.params.product_id)
        .then((data) => {
            if (data.length != 0){
                console.log('reading reviews success!');
                return res.json(data);
            }
            console.log('reading reviews success!');
            return res.json({problem: 'there are no reviews for this prouct yet :('});
        })
        .catch((err) => {
            console.log(err);
            return res.json(error.error500);
        })
    })

    // to post the review after log in
    products.post('/:product_id/reviews', checkToken, (req, res) => {

        jwt.verify(req.token, configdata.secretkey, (err, authData) => {
            if (!err){

                knex
                .select('name', 'customer_id')
                .from('customer')
                .where('customer.email', authData.email)
                .then((data) => {

                    knex('review')
                    .insert({
                        name: data[0].name,
                        review: req.body.review,
                        rating: req.body.rating,
                        created_on: new Date(),
                        product_id: req.params.product_id,
                        customer_id: data[0].customer_id
                    })
                    .then((insertsuccess) => {
                        console.log('your review inserted successfully!');
                        return res.json({response :'review inserted!'});
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json(error.error500);
                    })
                })
            }
            else {
                console.log({error_name: err.message, tokenExpiredAt: err.expiredAt});
                return res.sendStatus(403);
            }
        })
    })
}
