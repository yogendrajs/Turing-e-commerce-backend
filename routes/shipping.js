// Everything about shippings
let error = require('../server');

module.exports = function(shipping, knex){
    // to get all shipping regions
    shipping.get('/', (req, res) => {
        knex('shipping_region')
        .then((data) => {
            console.log('shipping regions data fetched!');
            return res.json(data);
        })
        .catch((err) => {
            console.log(err);
            return res.json(error.error500);
        })
    })

    // to get shipping regions by shipping_region_id
    shipping.get('/:shipping_region_id', (req, res) => {
        let shipping_region_id = req.params.shipping_region_id;
        knex
        .select(
            'shipping_id',
            'shipping_type',
            'shipping_cost',
            'shipping_region.shipping_region_id'
        )
        .from('shipping_region')
        .join('shipping', function(){
            this.on('shipping_region.shipping_region_id', 'shipping.shipping_region_id')
        })
        .where('shipping_region.shipping_region_id', shipping_region_id)
        .then((data) => {
            console.log('shipping region fetched by shipping_region_id');
            return res.json(data);
        })
        .catch((err) => {
            console.log(err);
            return res.json(error.error500);
        })
    })
}