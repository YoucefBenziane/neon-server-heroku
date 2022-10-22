var express = require("express");
var bodyParser = require("body-parser");
var axios = require("axios");
const { Pool } = require('pg');
// your credentials
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@
${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
     ssl: isProduction
});
// ssl: { rejectUnauthorized: false }
var app = express();
var cors = require("cors");
const db = require('./models/database');
const coupon = require('./models/stories');
const STRIPE_SDK = require('stripe');
const stripe = new STRIPE_SDK('sk_live_d43r00imffQUpmXF4dfGcU3l00ejoGqOw9');
//const stripe = new STRIPE_SDK('sk_test_VePHdqKTYQjKNInc7u56JBrQ');
const path = require('path');
var multer = require('multer');
var validator = require("email-validator");

var cloud = require('./cloudinaryConfig');
const nodemailer = require('nodemailer');

var EmailTemplates = require('swig-email-templates');


//multer.diskStorage() creates a storage space for storing files. 
var storage = multer.diskStorage({
destination:function(req, file,cb){
if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
cb(null, '/app');
}else{
cb({message: 'this file is neither a video or image file'}, false)
}
},
filename: function(req, file, cb) {
cb(null, file.originalname);
}
})
var upload = multer({storage:storage});
var corsOptions = {
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  app.use(cors(corsOptions));


/*var commandStatesMap = ['created', 'traite', 'maquette', 'commande', 'paye', 'livraison'];
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());*/
    db.pool.query('SELECT email, name, id FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
            console.log("erreur de base de donnée");
        }
        //console.log("process.env.cloud"+process.env.cloud);
        //console.log("process.env.key"+process.env.key);
        //console.log("process.env.pass"+process.env.pass);
        console.log("réponse donnée email"+results.rows[0].email);
        console.log("réponse donnée name"+results.rows[0].name);
        console.log("réponse donnée id"+results.rows[0].id);
    });
 


app.get('/coupons', coupon.getCoupons);
app.get('/coupons/:name', coupon.getCouponById);
app.put('/coupons/:name', coupon.updateCoupon);
app.delete('/louzoncouponsezra/:name', coupon.deleteCoupon);
app.post('/louzoncouponsezra', coupon.createCoupon);
app.get('/users', db.getUsers);
app.get('/users/:id', db.getUserById);
app.post('/users', db.createUser);
app.post('/relance', db.relancerUser);
app.get('/resetPassword/:id', db.sendResetPassword);
app.post('/login', db.login);
app.put('/users/:id', db.updateUser);
app.post('/users/:id/command', db.addCommandToUser);
app.delete('/users/:id', db.deleteUser);

app.get('/', function (req, res) {
    res.send(commands);
});
//const spanishStringDetector = 'testspanish'

app.post('/login', function (req, res) {
    var user_name = req.body.user;
    var password = req.body.password;
    res.end("yes");
});

app.post('/command', function (req, res) {
    //commands = null;
    if(req.body) {
        console.log("Command data = " + req.body );
        commands.push(req.body);
    }
    console.log("Command data TESTE = " + req.body );
    res.send(commands);
});
//app.post('/pay', db.addCommandToUser);

// let message = {
//     from: 'Nodemailer <example@nodemailer.com>',
//     to: 'Nodemailer <example@nodemailer.com>',
//     subject: 'AMP4EMAIL message',
//     text: 'For clients with plaintext support only',
//     html: '<p>Bonsoir désolé de vous déranger vous reste t il du Ketchup par hasard ?</p>',
//     amp: `<!doctype html>
//     <html ⚡4email>
//       <head>
//         <meta charset="utf-8">
//         <style amp4email-boilerplate>body{visibility:hidden}</style>
//         <script async src="https://cdn.ampproject.org/v0.js"></script>
//         <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
//       </head>
//       <body>
//         <p>Image: <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
//         <p>GIF (requires "amp-anim" script in header):<br/>
//           <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
//       </body>
//     </html>`
// }




const tempUpload = 'get-multer-monq@92'
var EmailTemplates = require('swig-email-templates');

    app.post('/clientFileUpload', upload.single('file'), async function (req, res) {
/*
    const userId = parseInt(req.query.userId);
*/
        console.log("INFO RECU: "+req.file.path);

        cloud.uploads(req.file.path).then((fileRes) => {
            res.json(fileRes.url);
            let demandOrCommand = 'DEMANDE'
            if(req.body.order === true) {
                demandOrCommand = 'COMMANDE'
            }
            var templates = new EmailTemplates({root: path.join(__dirname, './models/')});
            var context = {
                order: demandOrCommand,
                email: req.body.email
            }
            for(let i in req.body) {
                if(i !== 'order') {
                    context[i] = req.body[i]
                }
             }
            templates.render('alldemands.html', context, async function (err, html, text, subject) {
                // Send email
                let transporter = nodemailer.createTransport({
                    host: 'smtp.zoho.eu',
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: 'alblzn@zohomail.eu',
                        pass: tempUpload
                    }
                });

                let message = {
                    from: 'alblzn@zohomail.eu',
                    to: 'shop@dessinemoiunneon.fr',
                    subject: demandOrCommand,
                    html: html,
                    attachments: req.file ? [{
                        filename: 'dessin-technique.png',
                        path: fileRes.url,
                        contentType : 'urlencoded'
                    }] : []
                };


                await transporter.sendMail(message, (error, info) => {
                    if (error) {
                        return console.log('Error while sending mail: ' + error);
                    } else {
                        console.log('Message sent: %s', info.messageId);

                    }
                })
            });

        /*        db.pool.query('SELECT * FROM users WHERE id = $1', [userId], (error, results) => {
                    if (error) {
                        throw error
                    }

                })*/
    }, err => {
        console.log('err ', err)
    })
})


   app.listen(process.env.PORT || 5555 , function () {
        console.log("Started on PORT:-> process.env.PORT " , process.env.PORT );
    });
 
