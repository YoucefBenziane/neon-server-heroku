require('dotenv').config();
var fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
// your credentials
const isProduction = process.env.NODE_ENV === 'production'
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@
${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const pool = new Pool({
    // user: 'me',
    // host: 'localhost',
    // database: 'commands',
    // port: 5432,
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction,
});

const getStoriess = (request, response) => {
    pool.query('SELECT * FROM Storiess ORDER BY price ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
};

const getCoupons = (request, response) => {
    pool.query('SELECT * FROM coupons ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
};
const getCouponById = (request, response) => {
    const name = request.params.name;
    pool.query('SELECT * FROM coupons WHERE name = $1', [name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows[0])
    })
};
const createCoupon = async (request, response) => {
    const {expirationdate, maxcount, name, price } = request.body;

    const creationDate = new Date()
    const useCount = 0
    const disabled = false
    const id = 0
    pool.query('INSERT INTO coupons (creationdate, disabled, expirationdate, maxcount, name, price, usecount) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [creationDate, disabled, expirationdate, maxcount, name, price, useCount], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
};
const updateCoupon = (request, response) => {
    const name = request.params.name;
    const { expirationdate, maxcount, price } = request.body;
    const useCount = 0;
    const creationDate = new Date();
    const disabled = false;
    console.log(expirationdate, maxcount, name, price)
    pool.query(
        'UPDATE coupons SET creationdate = $1, disabled = $2, expirationdate = $3, maxcount = $4, name = $5, price = $6, usecount = $7  WHERE name = $5',
        [creationDate, disabled, expirationdate, maxcount, name, price, useCount],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Storiess modified with ID: ${name}`);
        }
    )
};
const deleteCoupon = (request, response) => {
    const name = request.params.name;

    pool.query('DELETE FROM coupons WHERE name = $1', [name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`coupons deleted with ID: ${name}`);
    })
};

const getStoriesById = (request, response) => {
    const name = request.params.name;
    pool.query('SELECT * FROM Storiess WHERE name = $1', [name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows[0])
    })
};


const createStories = async (request, response) => {
    const {name, price, maxCount, expirationDate } = request.body;
    // const { rows } = await pool.query(text, [email]);
    // if (rows[0]) {
    //     return res.status(400).send({'message': 'The email you provided already exists here'});
    // }
    const creationDate = new Date()
    const useCount = 0
    const disabled = false
    const id = 0
    pool.query('INSERT INTO Storiess (name, price, maxCount, expirationDate, creationDate, useCount, disabled) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, price, maxCount, expirationDate, creationDate, useCount, disabled], (error, results) => {
            if (error) {
                throw error
            }
            // console.log('user payload : ', results);
            response.status(200).json(results.rows)
        })
};


const updateStories = (request, response) => {
    const name = request.params.name;
    const { price, maxcount, expirationdate, disabled, usecount } = request.body;
    console.log(price, maxcount, expirationdate, disabled, usecount)
    pool.query(
        'UPDATE Storiess SET name = $1, price = $2, maxCount = $3, expirationDate = $4, disabled = $5, useCount = $6  WHERE name = $1',
        [name, price, maxcount, expirationdate, disabled, usecount],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Storiess modified with ID: ${name}`);
        }
    )
};

const deleteStories = (request, response) => {
    const name = request.params.name;

    pool.query('DELETE FROM coupons WHERE name = $1', [name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`coupons deleted with ID: ${name}`);
    })
};


module.exports = {
    getCoupons,
    getCouponById,
    createCoupon,
    deleteCoupon,
    updateCoupon

};
