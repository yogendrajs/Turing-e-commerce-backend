// Everything about departments
var err = require('../server');

module.exports = function(departments, knex){
    // to get all the departments
    departments.get('/', (req, res) => {
        knex.select('*').from('department')
        .then((departmentList) => {
            console.log('data read success');
            res.json(departmentList);
            // res.send(error);
        })
        .catch((error) => {
            console.log('error reading data from departments', error);
        })
    })

    // to get department by department id
    departments.get('/:department_id', (req, res) => {
        knex.select('*').from('department').where('department_id', req.params.department_id)
        .then((departbyid) => {
            console.log('data by id success');
            if (departbyid.length == 0){
                return res.json(err.err400);
            }
            return res.json(departbyid[0]);
        })
        .catch((error) => {
            console.log('there is an error in your query', error);
        })
    })
}

