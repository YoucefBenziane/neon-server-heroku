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

const getCommands = (request, response) => {
    pool.query('SELECT * FROM Commands ORDER BY price ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
};

const getCommandById = (request, response) => {
    const name = request.params.name;
    pool.query('SELECT * FROM Commands WHERE name = $1', [name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows[0])
    })
};


const createCommand = async (request, response) => {
    const {name, price, maxCount, expirationDate } = request.body;
    // const { rows } = await pool.query(text, [email]);
    // if (rows[0]) {
    //     return res.status(400).send({'message': 'The email you provided already exists here'});
    // }
    const creationDate = new Date()
    const useCount = 0
    const disabled = false
    const id = 0
    pool.query('INSERT INTO Commands (name, price, maxCount, expirationDate, creationDate, useCount, disabled) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, price, maxCount, expirationDate, creationDate, useCount, disabled], (error, results) => {
            if (error) {
                throw error
            }
            // console.log('user payload : ', results);
            response.status(200).json(results.rows)
        })
};


const updateCommand = (request, response) => {
    const name = request.params.name;
    const { price, maxcount, expirationdate, disabled, usecount } = request.body;
    console.log(price, maxcount, expirationdate, disabled, usecount)
    pool.query(
        'UPDATE Commands SET name = $1, price = $2, maxCount = $3, expirationDate = $4, disabled = $5, useCount = $6  WHERE name = $1',
        [name, price, maxcount, expirationdate, disabled, usecount],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Commands modified with ID: ${name}`);
        }
    )
};

const deleteCommand = (request, response) => {
    const name = request.params.name;

    pool.query('DELETE FROM Commands WHERE name = $1', [name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Commands deleted with ID: ${name}`);
    })
};


module.exports = {
    getCommands,
    getCommandById,
    createCommand,
    deleteCommand,
    updateCoupon

};
