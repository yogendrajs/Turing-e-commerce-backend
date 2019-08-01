// Everything about categories
let err = require('../server');

module.exports = function(categories, knex) {
    // to get all the categories
    categories.get('/', (req, res) => {
        knex
            .select('*')
            .from('category')
            .then((category) => {
                let data = {
                    'count': category.length,
                    'rows': category
                }
                return res.json(data);
            })
            .catch((error) => {
                console.log(error);
                return res.json(err.error500);
            })
    })

    // to get category by category id
    categories.get('/:category_id', (req, res) => {
        knex
            .select('*')
            .from('category')
            .where('category_id', req.params.category_id)
            .then((catbyid) => {
                if (catbyid.length == 0) {
                    return res.json(err.error500);
                }
                console.log('data read successfully');
                return res.json(catbyid[0]);
            })
            .catch((error) => {
                console.log(err.error500)
            })
    })

    // to get category of a product
    categories.get('/inProduct/:product_id', (req, res) => {
        knex
            .select(
                'product_category.category_id',
                'category.department_id',
                'category.name'
            )
            .from('product_category')
            .join('category', function() {
                this.on('product_category.category_id', '=', 'category.category_id')
            })
            .where('product_category.product_id', req.params.product_id)
            .then((data) => {
                if (data.length == 0) {
                    return res.json(err.error500);
                }
                console.log('data by category_id sent successfully');
                return res.json(data);
            })
            .catch((error) => {
                console.log(err.error500);
            })
    })

    // to get categories of a department
    categories.get('/inDepartment/:department_id', (req, res) => {
        knex
            .select(
                'category_id',
                'name',
                'description',
                'department_id'
            )
            .from('category')
            .where('department_id', '=', req.params.department_id)
            .then((data) => {
                res.json(data);
                console.log('data by department_id sent successfully');
            })
            .catch((error) => {
                console.log(err.error500);
            })
    })
}