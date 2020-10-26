const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http').createServer(app)
const io = require('socket.io')(http)

require('dotenv/config');

const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const utilityFunctions = require("./utilityMethods");


//--------------------Start of Middleware----------------------//
app.use(bodyParser.json());
app.set('view-engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
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
    res.render('index.ejs')
})

//Connect to DB
mongoose.connect(
    process.env.DB_CONNECTION, 
    {useNewUrlParser: true,
    useUnifiedTopology: true },
    () => { console.log('Connected to DB!')
});

io.on('connection', socket => {
    //console.log('a user connected!')
    socket.on('update-sheet-availability', () => {
        //console.log("selected")
    })
    socket.on('disconnect', () => {
      //console.log('user disconnected!')
    })
})

http.listen(3000, () => console.log('The app is running on localhost:3000'));