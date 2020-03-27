'use strict';

const express = require('express');
const router = express.Router();
const config = require('../config');
const sql = require('mssql');

let pool;
sql.connect(config.stats_america.db).then(_pool=>{
    pool = _pool;
}).catch(err=>{
	console.error(err);
});
sql.on('error', err => {
	throw err;
})
router.get('/agedist/:fips', (req, res, next)=>{
	// make sure that any items are correctly URL encoded in the connection string
    pool.request()
    //.input('input_parameter', sql.Int, value)
    .query('select TOP 5 * from dbo.FEMA_disasters;')
    .then(res=>{
        res.json(res);
    });
});

module.exports = router;
