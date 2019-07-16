// Everything about Taxes
var error = require('../server');

module.exports = function(tax, knex){
    // get all taxes
    tax.get('/', (req, res) => {
        knex('tax')
        .then((data) => {
            console.log('all tax data sent!')
            return res.json(data);
        })
        .catch((err) => {
            console.log(err);
            return res.json(error.error500);
        })
    })

    // get tax by tax_id
    tax.get('/:tax_id', (req, res) => {
        knex('tax')
        .where('tax.tax_id', req.params.tax_id)
        .then((data) => {
            console.log('data by tax_id sent!');
            return res.json(data);
        })
        .catch((err) => {
            return res.json(error.error500);
        })
    })
}