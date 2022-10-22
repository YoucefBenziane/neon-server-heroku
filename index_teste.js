console.log("lancement réussi!!");
require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");
//var axios = require("axios")
var app = express();
var cors = require("cors");
//const db = require('./models/database');
const { Pool } = require('pg');
// your credentials
const isProduction = process.env.NODE_ENV === 'production'
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@
${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
 pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
console.log("nom de la base: "+process.env.DATABASE_URL);
console.log("process.env.NODE_ENV: "+process.env.NODE_ENV);
console.log("process.env.DB_DATABASE: "+process.env.DB_DATABASE);
console.log("process.env.DB_USER: "+process.env.DB_USER);
console.log("process.env.DB_PASSWORD: "+process.env.DB_PASSWORD);

    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
            console.log("erreur de base de donnée");
        }
        console.log("réponse donnée"+results.rows);
    });
/*
const getUsers = (request, response) => {
    pool.query('SELECT * FROM Users ', (error, results) => {
        if (error) {
            console.log("erreur de recuperation bdd");
            throw error
        }
        response.status(200).json(results.rows)
    })
};*/

app.get('/', function (req, res) {
        pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
            console.log("erreur de base de donnée");
        }
        console.log("réponse donnée"+res.rows);
        res.status(200).json(res.rows)
                res.send("teste"+res.rows);
    });
});

   app.listen(process.env.PORT || 8000 , function () {
        console.log("Started on PORT process.env.PORT " , process.env.PORT );
    });
