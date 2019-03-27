
var express = require('express');
var bodyParser = require('body-parser')
var server = express()

var fs = require('fs')
var multer = require('multer')

var session = require("express-session")
var passport = require("passport")
var LocalStrategy = require('passport-local').Strategy



server.use(express.static('./build'))
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())


server.use(session({ secret: "secret-word" }));
server.use(passport.initialize());
server.use(passport.session());

// database code start
var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/project');
mongoose.connect('mongodb+srv://mhassan:jamia25818@cluster0-ud40k.mongodb.net/test?retryWrites=true',{dbName:'IslaicCenter'});


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("successfuly connect to db")
});


var kittySchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    password: String,


});
var commentSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: Number,
    website: String,
    comment: String,
    livechat: String,

});
var prayertiming = new mongoose.Schema({
    fajar: String,
    zuhar: String,
    asar: String,
    magrib: String,
    isha: String,
    time: String,

});
var createaccount = mongoose.model('createaccount', kittySchema);
var comment = mongoose.model('comment', commentSchema);
var time = mongoose.model('prayertiming', prayertiming);


var picture;
server.post('/createaccount', function (req, res) {
    var user = new createaccount({ name: req.body.name, email: req.body.email, mobile: req.body.mobile, password: req.body.password, });
    picture = req.body.email;
    user.save(function (err, fluffy) {
        if (err)
            return console.error(err);
        res.send("account created.")
        console.log(fluffy)
    });
});

server.post('/comment', function (req, res) {
    var usercomment = new comment({ name: req.body.name, email: req.body.email, mobile: req.body.mobile, website: req.body.website, comment: req.body.comment, livechat: "livechat" });
    res.send("account created.")
    usercomment.save(function (err, fluffy) {
        if (err)
            return console.error(err);
        console.log(fluffy)
    });
});
server.get('/savetime', function (req, res) {
    var timing = new time({ fajar: "04:00", zuhar: "02:00", asar: "05:00", magrib: "07:00", isha: "09:00", time: "time" });
    res.send("time saved.")
    timing.save(function (err, result) {
        if (err)
            return console.error(err);
        console.log(result)
    });
});

server.post('/updatatime', (req, res) => {


    time.updateOne({ time:"time"  }, { fajar: req.body.fajar ,zuhar: req.body.zuhar ,asar:req.body.asar,magrib:req.body.magrib,isha:req.body.isha},  function (err, result) {
        if (err)
            return res.send(err)
        res.send("Password Successfuly Changed.")
        console.log(req.body)
    });
})
 
server.get('/prayertiming', function (req, res) {

    time.find({ time: 'time' }, function (err, result) {
        if (err)
            return res.send("err")
        res.json(result)


    });
});



server.get('/commentdb', function (req, res) {

    comment.find({ livechat: 'livechat' }, function (err, result) {
        if (err)
            return res.send("err")
        res.json(result)


    });
});


// database end

var usernmae;
var password;
var users = [];


passport.use(new LocalStrategy(
    function (req, res, next) {

        var user = users.find((user) => {
            return user.name === usernmae && user.password === password;
        })

        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }

    }
));

passport.serializeUser(function (user, next) {
    next(null, user.id);
});

passport.deserializeUser(function (id, next) {
    var user = users.find((user) => {
        return user.id === id;
    })

    next(null, user);
});

server.post('/login', passport.authenticate('local'), function (req, res) {

    res.send("good")
});


server.post('/aouthdatabase', function (req, res) {

    createaccount.find({ name: req.body.username, password: req.body.password }, function (err, result) {
        if (err)
            return res.send("err")
        if (result) {

            usernmae = req.body.username;
            password = req.body.password;
            res.send(result)
            users = result;
        }


    });
});

server.get('/home', function (req, res) {

    if (!req.isAuthenticated()) {
        res.send("Login Required to visit this page")
    } else {
        res.send("Yes you're logged in, and your data is available here: " + req.user)
    }

});
server.get('/logout', (req, res) => {
    req.session.destroy();
    //   console.log(l)
    // res.redirect('/');
    res.send("logout")

    //    res.send("ok")
})

// contactus page start
server.post('/add', (req, res) => {
    "use strict";
    require('dotenv').config();
    const nodemailer = require("nodemailer");

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mhassan25818@gmail.com', // here use your real email
                pass: 'enter your gmail password' // to check your project please write your gmail and password          }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: "req.body.name123", // sender address
            to: req.body.useremail, // list of receivers
            subject: req.body.name, // Subject line
            text: "Contact US", // plain text body
            html: "<br></br>" + "Message:" + req.body.message + "<br></br>" + "Phone:" + req.body.mobile + "<br></br>" + req.body.useremail// html body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        res.send("Message successfully sent.")
    }

    main().catch(console.error);


})


// contactus page end

// forget page start
server.post('/forget', (req, res) => {
    "use strict";
    require('dotenv').config();
    const nodemailer = require("nodemailer");

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mhassan25818@gmail.com', // here use your real email
                pass: 'jamia2211' // put your password correctly (not in this question please)
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: "req.body.name123", // sender address
            to: req.body.email, // list of receivers
            subject: "My Project", // Subject line
            text: "Contact US", // plain text body
            html: "Your Verifictaion Code is:" + req.body.code // html body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);

    res.send("Message successfully sent.")

})


// forget page end

// newpassword start

server.post('/newpassword', (req, res) => {


    createaccount.updateOne({ email: req.body.email }, { password: req.body.newpassword }, function (err, result) {
        if (err)
            return res.send(err)
        res.send("Password Successfuly Changed.")
    });
})

// newpassword End

// email validation
server.post('/email', (req, res) => {


    createaccount.find({ email: req.body.email }, function (err, result) {
        if (err)
            return res.send(err)
        res.json(result.length)
        console.log(result.length)

    });
})
// end email validation

// start picture upload
var customConfig = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, './build/upload')
    },
    filename: function (req, file, next) {
        next(null, picture + file.originalname.slice(file.originalname.length - 4, file.originalname.length))

        console.log(file)
        console.log(req)

    }
})

var upload = multer({ storage: customConfig })
server.post('/profile', upload.array('profilePicture', 10), function (req, res, next) {
    // console.log(req.files)
    res.send("File successfully uploaded.")
})

// end picture upload




server.use((err, req, res, next) => {
    console.warn(err)
    res.status(500).send("Error Catched by error handler.")
})
server.listen( process.env.PORT ||2000, () => { console.log("Server successfully started.") })

// server.listen(process.env.PORT, () => { console.log("Server successfully started.") })




