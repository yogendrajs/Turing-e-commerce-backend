// Everything about shopping cart
var error = require('../server');

module.exports = function(shoppingcart, knex){

    // to generate a unique cart_id
    shoppingcart.get('/generateUniqueId', (req, res) => {
        var text = "", charset = "ab@cd12efgh34ij$kl56mnop78qr&st90uv*wx!yz"; // `#` and `%` do not work in url
        for (var i = 0; i < 18; i++){
            text += charset.charAt(Math.floor(Math.random()*charset.length));
        }
        console.log(`your cart_id has been sent!`);
        res.send({cart_id: text});
    })

    // to add a product in the cart
    shoppingcart.post('/add', (req, res) => {
        let {body} = req;
        let {cart_id, product_id, attributes} = body;
        let quantity;

        // for showing whole data to the user
        function selection(){
            
            knex
            .select(
                'item_id',
                'name',
                'attributes',
                'shopping_cart.product_id',
                'image',
                'price',
                'quantity'
            )
            .from('shopping_cart')
            .join('product', function(){
                this.on('shopping_cart.product_id', 'product.product_id')
            })
            .where('shopping_cart.cart_id', cart_id)
            .then((data) => {
                console.log('your cart has been posted!')
                data.map(eachItem => eachItem.subtotal = parseFloat((eachItem.quantity * eachItem.price).toFixed(2)))

                return res.json(data);
            })
            .catch((err) => {
                console.log(err);
                return res.send(error.error500);
            })
        }

        // adding data starts here
        knex
        .select('*')
        .from('shopping_cart')
        .where('shopping_cart.cart_id', cart_id)
        .andWhere('shopping_cart.product_id', product_id)
        .andWhere('shopping_cart.attributes', attributes)
        .then((data) => {
            if (data.length == 0){
                // quantity = 1

                knex('shopping_cart')
                .insert({
                    cart_id: cart_id,
                    product_id: product_id,
                    attributes: attributes,
                    quantity: 1,
                    added_on: new Date()
                })
                .then(() => {
                    selection(); // to show all the data of the user
                })
                .catch((err) => {
                    console.log(err);
                    res.send('data insertion error sent to console!');
                })

            }else {
                quantity = data[0].quantity+1
                console.log(quantity)
                
                knex('shopping_cart')
                .update({
                    'quantity': quantity,
                    'added_on': new Date()
                })
                .where('shopping_cart.cart_id', cart_id)
                .andWhere('shopping_cart.product_id', product_id)
                .andWhere('shopping_cart.attributes', attributes)
                .then(() => {
                    selection(); // to show all the data of the user
                })
            }
        })
        .catch((err) => {
            console.log(err);
            res.json(error.error500);
        })
    })

    // to get the product from cart_id
    shoppingcart.get('/:cart_id', (req, res) => {
        knex
        .select(
            'item_id',
            'name',
            'attributes',
            'shopping_cart.product_id',
            'image',
            'price',
            'quantity'
        )
        .from('shopping_cart')
        .join('product', function(){
            this.on('shopping_cart.product_id', 'product.product_id')
        })
        .where('shopping_cart.cart_id', req.params.cart_id)
        .then((data) => {
            data.map(eachItem => eachItem.subtotal = parseFloat((eachItem.quantity * eachItem.price).toFixed(2)));
            console.log('sent data by shopping cart!');
            return res.json(data);
        })
        .catch((err) => {
            console.log(err);
            return res.json(error.error500);
        })
    })

    // update the cart by item_id (quantity)
    shoppingcart.put('/update/:item_id', (req, res) => {

        knex('shopping_cart')
        .update({
            quantity: req.body.quantity,
            added_on: new Date()
        })
        .where('shopping_cart.item_id', req.params.item_id)
        .then(() => {
            knex
            .select('cart_id')
            .from('shopping_cart')
            .where('shopping_cart.item_id', req.params.item_id)
            .then((cartdata) => {
                knex
                .select(
                    'item_id',
                    'name',
                    'attributes',
                    'shopping_cart.product_id',
                    'image',
                    'price',
                    'quantity'
                )
                .from('shopping_cart')
                .join('product', function(){
                    this.on('shopping_cart.product_id', 'product.product_id')
                })
                .where('shopping_cart.cart_id', cartdata[0].cart_id)
                .then((data) => {
                    console.log('your cart has been updated!')
                    data.map(eachItem => eachItem.subtotal = parseFloat((eachItem.quantity * eachItem.price).toFixed(2)));            
                    return res.json(data);
                })
                .catch((err) => {
                    console.log(err);
                    return res.send(error.error500);
                })
            })
        })
    })

    // to empty a cart
    shoppingcart.delete('/empty/:cart_id', (req, res) => {
        knex('shopping_cart')
        .where('shopping_cart.cart_id', req.params.cart_id)
        .del()
        .then(() => {
            return res.json({deldata: 'data deleted successfully!'});
        })
        .catch((err) => {
            console.log(err);
            return res.json(error.error500);
        })
    })

    // return a total Amount from Cart
    shoppingcart.get('/totalAmount/:cart_id', (req, res) => {
        knex
        .select(
            'price',
            'quantity'
        )
        .from('shopping_cart')
        .join('product', function(){
            this.on('shopping_cart.product_id', 'product.product_id')
        })
        .where('shopping_cart.cart_id', req.params.cart_id)
        .then((data) => {
            let totalAmount = data.map(eachItem => eachItem.subtotal = parseFloat((eachItem.price * eachItem.quantity).toFixed(2))).reduce((a, b) => a+b, 0);
            return res.json({total_amount: totalAmount});
        })
    })

    // making a new table for saving products for later 
    shoppingcart.get('/saveForLater/:item_id', (req, res) => {
        let item_id = req.params.item_id;

        knex.schema.hasTable('save_later')
        .then((exists)=>{
            if(!exists){
                return knex.schema.createTable('save_later',function(table){
                    table.integer('item_id').primary();
                    table.string('cart_id');
                    table.integer('product_id');
                    table.string('attributes');
                    table.string('quantity');
                    // table.boolean('item_save').default(1);

                    knex
                    .select(
                        'item_id',
                        'cart_id',
                        'product_id',
                        'attributes',
                        'quantity'
                    )
                    .from('shopping_cart')
                    .where('shopping_cart.item_id', item_id)
                    .then((data) => {
                        knex('save_later')
                        .insert(data[0])
                        .then(() => {
                            knex('shopping_cart')
                            .where('shopping_cart.item_id', item_id)
                            .del()
                            .then(() => {
                                console.log('your product has been saved for later!');
                                res.json({save_later: 'product saved for later!'});
                            })
                        })
                        .catch((err) => {
                            console.log(err);
                            res.json('error inserting your data!');
                        })
                    })
                    .catch((err) => {
                        console.log(err);
                        res.json(error.error500);
                    })
                })
            }
            else {
                knex
                .select(
                    'item_id',
                    'cart_id',
                    'product_id',
                    'attributes',
                    'quantity'
                )
                .from('shopping_cart')
                .where('shopping_cart.item_id', item_id)
                .then((data) => {
                    knex('save_later')
                    .insert(data[0])
                    .then(() => {
                        knex('shopping_cart')
                        .where('shopping_cart.item_id', item_id)
                        .del()
                        .then(() => {
                            console.log('the product has been saved for later!');
                            res.json({save_later: 'product saved for later!'});
                        })
                    })
                    .catch((err) => {
                        console.log(err);
                        res.json('error inserting your data')
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.json(error.error500);
                })
            }
        })
    })

    // get products saved for later
    shoppingcart.get('/getSaved/:cart_id', (req, res) => {
        let cart_id = req.params.cart_id;

        knex
        .select(
            'item_id',
            'name',
            'attributes',
            'price'
        )
        .from('save_later')
        .join('product', function(){
            this.on('save_later.product_id', 'product.product_id')
        })
        .where('save_later.cart_id', cart_id)
        .then((data) => {
            return res.json(data);
        })
        .catch((err) => {
            return res.json(error.error500);
        })
    })

    // move a product to cart
    shoppingcart.get('/moveToCart/:item_id', (req, res) => {
        let item_id = req.params.item_id;

        knex('save_later')
        .where('save_later.item_id', item_id)
        .then((data) => {
            data[0].added_on = new Date();
            knex('shopping_cart')
            .insert(data[0])
            .then(() => {
                knex('save_later')
                .where('save_later.item_id', item_id)
                .del()
                .then(() => {
                    console.log('data moved to cart!');
                    return res.json({movedToCart: 'your data moved to cart!'});
                })
                .catch((err) => {
                    console.log(err);
                    return res.send('error deleting data from save_later');
                })
            })
            .catch((err) => {
                console.log(err);
                return res.send('data insertion error!');
            })
        })
        .catch((err) => {
            console.log(err);
            return res.json(error.error500);
        })
    })

    // to remove a product from the card using item_id
    shoppingcart.delete('/removeProduct/:item_id', (req, res) => {
        let item_id = req.params.item_id;

        knex('shopping_cart')
        .where('shopping_cart.item_id', item_id)
        .del()
        .then(() => {
            console.log('data deleted from cart using item_id!');
            return res.json({removeProduct: 'product removed by item_id!'});
        })
        .catch((err) => {
            console.log(err);
            return res.send(error.error500);
        })
    })
}