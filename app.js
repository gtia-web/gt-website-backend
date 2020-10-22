const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv/config');

const passport = require('passport')
const passportLocal = require('passport-local')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const utilityFunctions = require("./utilityMethods");


//--------------------Start of Middleware----------------------//
app.use(bodyParser.json());
app.set('view-engine', 'ejs')
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(cookieParser(process.env.SESSION_SECRET))

app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig')(passport);

//--------------------End of Middleware----------------------//

//ROUTES

app.use('/user', require('./routes/user'));
app.use('/Users/GetUser', require('./routes/Users/GetUser'));
app.use('/signups', require('./routes/signups'));

app.get('/', utilityFunctions.checkAuthenticated, (req, res) => {
    res.render('index.ejs', { firstname: req.user.FirstName })
})

//Connect to DB
mongoose.connect(
    process.env.DB_CONNECTION, 
    {useNewUrlParser: true,
    useUnifiedTopology: true },
    () => { console.log('Connected to DB!')
});

app.listen(3000);