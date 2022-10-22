// const { Client } = require('pg');
// const client = new Client();
// client.connect();
// client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
//     console.log(err ? err.stack : res.rows[0].message); // Hello World!
//     client.end()
// });

require('dotenv').config();
var fs = require('fs');
var sgTransport = require('nodemailer-sendgrid-transport');
var EmailTemplates = require('swig-email-templates');
const path = require('path');
var validator = require("email-validator");
var emailExistence = require("email-existence");

const nodemailer = require('nodemailer');
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
    ssl: isProduction
});
// ssl: { rejectUnauthorized: false }
const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        console.log("Get users: "+results.rows);
        response.status(200).json(results.rows)
    })
};
const name = 'TESTE NAME'

const getUserById = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
};


const sendResetPassword = (request, response) => {
    const id = parseInt(request.params.id);
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        console.log('showing result from query : ', results.rows);
        var user = results.rows[0];
        var ra256 = Math.random().toString(36).slice(-8);
        var context = {
            name: user['name'],
            newPassword: ra256
        };
        var templates = new EmailTemplates({ root: path.join(__dirname, '/') });
        templates.render('resetPass.html', context, async function (err, html, text, subject) {
            // Send email
            let transporter = nodemailer.createTransport({
                host: 'smtp.ionos.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: 'gavin@salle-hount.fr', // generated ethereal user
                    pass: process.env.pw// generated ethereal 
                }
            });
            await transporter.sendMail({
                from: 'gavin@salle-hount.fr',
                to: user['email'],
                subject: 'Demande de réinitialisation de votre mot de passe',
                html: html,
                text: text
            });
            console.log("Message sent: %s");
            pool.query(
                'UPDATE users SET password = $1 WHERE id = $2',
                [ra256, id],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                    response.status(200).send('password changed');
                }
            )


        });
    })
};

const createUser = async (request, response) => {
    const { name, email, nickname, type, password } = request.body;
    // const { rows } = await pool.query(text, [email]);
    // if (rows[0]) {
    //     return res.status(400).send({'message': 'The email you provided already exists here'});
    // }
    pool.query('INSERT INTO users (name, email, nickname, type, password, commands) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, email, nickname, type, password, '[]'], (error, results) => {
            if (error) {
                throw error
            }
            // console.log('user payload : ', results);
            console.log('before validator ', email, validator.validate(email));
         ;
            if(validator.validate(email)) {
                emailExistence.check(email, function(error, rese){
                    console.log('res: '+response);
                    if(rese) {
                        response.status(201).send('r');

                    } else {
                        response.status(404).send('email does not exist');

                    }
                })

            } else {
                response.status(403).json(`email not valid`);
            }
        })
};

const relancerUser = async (request, response) => {
    console.log("log relancé user");
   // const command = request.body;
   // console.log('from server: ', command, 'send email to ', command['email']);
    response.status(200).send("relancer user teste"); // j'ai aujouter pour tester
    // pool.query('INSERT INTO users (name, email, nickname, type, password, commands) VALUES ($1, $2, $3, $4, $5, $6)',

  /*  var context = {
    };
    var templates = new EmailTemplates({ root: path.join(__dirname, '/') });
    templates.render('relance.html', context, async function (err, html, text, subject) {
        // Send email
        let transporter = nodemailer.createTransport({
            host: 'smtp.ionos.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'gavin@salle-hount.fr', // generated ethereal user
                pass: tepu// generated ethereal password
            }
        });
        await transporter.sendMail({
            from: 'gavin@salle-hount.fr',
            to: command['email'],
            subject: 'Tu ne veux pas payer ?',
            html: html,
            text: text
        });
        console.log("Message sent: %s");

    });
    */
};

const updateUser = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, email, nickname, password, type, commands } = request.body;

    console.log('showing commands value ', commands);
    pool.query(
        'UPDATE users SET name = $1, email = $2, nickname = $4, password = $5, type = $6, commands = $7 WHERE id = $3',
        [name, email, id, nickname, password, type, JSON.stringify(commands)],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User modified with ID: ${id}`);
            if (request.body['dtFile']) {
                // fs.readFile(request.body['dtFile'], {encoding: 'utf-8'}, function(err,data){
                //     if (!err) {
                //         console.lo   g('received data: ' + data);
                //         response.writeHead(200, {'Content-Type': 'text/html'});
                //         response.write(data);
                //         response.end();
                //     } else {
                //         console.log(err);
                //     }
                // });
            }
            if (request.body['changeCommand']) {
                console.log('change command detected : ', request.body['changeCommand']['text'], request.body['changeCommand']['newState'])
                const commandText = request.body['changeCommand']['text'];
                const currentCommand = request.body['changeCommand']['command'];
                const newState = request.body['changeCommand']['newState'];
                if (commandText === 'customEmail') {
                    sendMail(newState, 'Demande de modif: ' + nickname + ' ' + name, 'contact');

                }
                if (newState === 'Prêt') {
                    // sendMail(email, 'Néon ' + commandText + ': Votre dessin technique! ', null);
                    var context = {
                      };
                    var templates = new EmailTemplates({root: path.join(__dirname, '/')});
                
         
                }
                if (newState === 'commandé') {
                    // sendMail(email, 'Néon ' + commandText + ' commandé avec succès ', null);
                    // db.sendMail(email, 'Né on '  + commandText +': Votre dessin technique! ', null); SEND TO GAVIN

                }
                if (newState === 'payé') {

                    // pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
                    //     if (error) {
                    //         throw error
                    //     }
                    //     // response.status(200).json(results.rows)
                    //     console.log('user: ', results.rows[0]);
                     
                    // })
                    const commandInfo = currentCommand['commandInfo'];
                    var context = {
                        name: commandInfo['nom'],
                        nickame: commandInfo['prénom'],
                        adress: commandInfo['adresse'],
                        city: commandInfo['ville'],
                        postal: commandInfo['code-postal'],
                        country:commandInfo['pays'],
                        id: currentCommand['id']
                    };
                    var templates = new EmailTemplates({ root: path.join(__dirname, '/') });
                    templates.render('paye.html', context, async function (err, html, text, subject) {
                        // Send email
                        let transporter = nodemailer.createTransport({
                            host: 'smtp.ionos.com',
                            port: 465,
                            secure: true, // true for 465, false for other ports
                            auth: {
                                user: 'gavin@salle-hount.fr', // generated ethereal user
                                pass: process.env.pw// generated ethereal password
                            }
                        });
                        await transporter.sendMail({
                            from: 'gavin@salle-hount.fr',
                            to: email,
                            subject: 'Néon en cours de livraison',
                            html: html,
                            text: text
                        });
                        console.log("Message sent: %s");
    
                    });
                    // db.sendMail(email, 'Né on '  + commandText +': Votre dessin technique! ', null); SEND TO GAVIN

                }
            }
        }
    )
};


/*const addCommandToUser = (request, response) => {


    const command = JSON.stringify(request.body);
  
};*/

const addCommandToUser = (request, response) => {
    const id = parseInt(request.params.id);
    let email = '';
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = dd + '/' + mm + '/' + yyyy;
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        console.log(results.rows[0].email, 'teste email');
        email = results.rows[0].email;
    })
    request.body['id'] = request.body['text'] + Math.floor(Math.random() * 1000000) + 1;
    request.body['creationDate'] = today;

    const command = JSON.stringify(request.body);
    pool.query(
        'UPDATE users SET commands = commands::jsonb || ($1)::jsonb WHERE id = $2',
        [command, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Added command to user: ${id}`);
            if (request.body['type'] === 'consumer') {
                // sendMail(email, 'Néon ' + request.body['text'] + ' créé ! Nous préparons votre dessin technique', null);

                var context = {
                    text: request.body['text'],
                    format: request.body['height'],
                    color: request.body['colors'],
                    typo: request.body['typo'],
                    support: request.body['support']
                };
                var templates = new EmailTemplates({ root: path.join(__dirname, '/') });
                templates.render('demandeDT.html', context, async function (err, html, text, subject) {
                    // Send email
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.ionos.com',
                        port: 465,
                        secure: true, // true for 465, false for other ports
                        auth: {
                            user: 'gavin@salle-hount.fr', // generated ethereal user
                            pass: tepu// generated ethereal password
                        }
                    });
                    await transporter.sendMail({
                        from: 'gavin@salle-hount.fr',
                        to: email,
                        subject: 'Demande de néon bien reçue',
                        html: html,
                        text: text
                    });
                    console.log("Message sent: %s");

                });
            } else {
                // sendMail(email, 'Néon ' + request.body['text'] + ' créé ! Votre devis: ', null);
                var context = {
                    text: request.body['text'],
                    format: request.body['height'],
                    color: request.body['colors'],
                    typo: request.body['typo'],
                    support: request.body['support']
                };
                var templates = new EmailTemplates({ root: path.join(__dirname, '/') });
                templates.render('demandeDTPro.html', context, async function (err, html, text, subject) {
                    // Send email
                    let transporter = nodemailer.createTransport({
                        host: 'smtp.ionos.com',
                        port: 465,
                        secure: true, // true for 465, false for other ports
                        auth: {
                            user: 'gavin@salle-hount.fr', // generated ethereal user
                            pass: process.env.pw// generated ethereal password
                        }
                    });
                    await transporter.sendMail({
                        from: 'gavin@salle-hount.fr',
                        to: email,
                        subject: 'Demande de néon bien reçue',
                        html: html,
                        text: text
                    });
                    console.log("Message sent: %s");

                });
            }
        }
    )
};

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with ID: ${id}`);
    })
};



const comparePassword = (hashPassword, password) => {
    console.log('comparing ', hashPassword, 'with ', password);
    if (password === hashPassword) {
        return true
    }
    return false;
};

const login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({ 'message': 'Some values are missing' });
    }
    // if (isValidEmail(req.body.email)) {
    //     //     return res.status(400).send({ 'message': 'Please enter a valid email address' });
    //     // }
    const text = 'SELECT * FROM users WHERE email = $1';
    try {
        const { rows } = await pool.query(text, [req.body.email]);
        if (!rows[0]) {
            return res.status(400).send({ 'message': 'The email you provided is incorrect' });
        }
        if (!comparePassword(rows[0].password, req.body.password)) {
            return res.status(400).send({ 'message': 'Faux mot de passe fais attention a toi' });
        }
        // const token = Helper.generateToken(rows[0].id);
        return res.status(200).send({ userData: rows });
    } catch (error) {
        return res.status(400).send(error)
    }
};


// a generic query, that executes all queries you send to it
function query(text) {
    return new Promise((resolve, reject) => {
        pool
            .query(text)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}


async function sendMail(target, subject, attachment) {
    const content = 'Mettre le contenu ici';
    console.log('process', process.env.EMAIL_PASSWORD);



    let transporter = nodemailer.createTransport({
        host: 'smtp.ionos.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'gavin@salle-hount.fr', // generated ethereal user
            pass: tepu// generated ethereal password
        }
    });
    // send mail with defined transport object
    if (attachment && attachment !== 'contact') {

    } else if (attachment === 'contact') {
        let info = await transporter.sendMail({
            from: '"L équipe de Dessine moi un néon" <gavin@salle-hount.fr>', // sender address
            to: 'contact@dessinemoiunneon.fr', // list of receivers
            subject: 'Un yencli a une question', // Subject line
            text: target, // plain text body
            html: target // html body   
        });
    }

    else {
        let info = await transporter.sendMail({
            from: '"L équipe de Dessine moi un néon" <gavin@salle-hount.fr>', // sender address
            to: target, // list of receivers
            subject: 'Un yencli a une question', // Subject line
            text: content, // plain text body
            html: '' // html body
        });
    }
    console.log("Message sent: %s");
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}




module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,

    addCommandToUser,
    login,
    pool,
    sendMail,
    sendResetPassword,
    relancerUser
};

