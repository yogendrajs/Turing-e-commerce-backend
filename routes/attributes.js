// Everything about attributes
let err = require('../server');

module.exports = function(attributes, knex){
    // to get the whole list of attributes
    attributes.get('/', (req, res) => {
        knex
        .select('*')
        .from('attribute')
        .then((data) => {
            res.json(data);
            console.log('success reading attribute data');
        })
        .catch((error) => {
            res.json(err.error500);
            console.log('there is an error in sql syntax');
        })
    })
    
    // to get the attributes list by attribute id
    attributes.get('/:attribute_id', (req, res) => {
        knex
        .select('*')
        .from('attribute')
        .where('attribute_id', req.params.attribute_id)
        .then((data) => {
            if (data.length != 0){
                console.log('success reading data by attr_id');
                return res.json(data);
            }return res.json(err.error500);
        })
        .catch((error) => {
            console.log('there is an error in your sql syntax');
        })
    })
    
    // to get values attribute from attribute
    attributes.get('/values/:attribute_id', (req, res) => {
        knex
        .select('*')
        .from('attribute_value')
        .where('attribute_id', req.params.attribute_id)
        .then((data) => {
            if (data.length != 0){
                console.log('success reading data by attr_id');
                return res.json(data);
            }return res.json(err.error500);
        })
        .catch((error) => {
            console.log('there is an error in your sql syntax', error);
        })
    })
    
    // to get all attributes with product id
    attributes.get('/inProduct/:product_id', (req, res) => {
        knex
        .select(
            'attribute.name as attribute_name', 
            'attribute_value.attribute_value_id', 
            'attribute_value.value as attribute_value'
            )
        .from('attribute_value')
        .join('product_attribute', function(){
            this.on('attribute_value.attribute_value_id', '=', 'product_attribute.attribute_value_id')
        }).join('attribute', function(){
            this.on('attribute.attribute_id', '=', 'attribute_value.attribute_id')
        })
        .where('product_attribute.product_id', req.params.product_id)
        .orderBy('attribute.name', 'asc')
    
        .then((data) => {
            res.json(data);
            console.log('success reading data');
        })
        .catch((error) => {
            res.json('there is an error in your sql syntax');
        })
    })
}
