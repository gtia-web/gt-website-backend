require('dotenv/config');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')


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
require('./utility/passportConfig')(passport);

//--------------------End of Middleware----------------------//

//---------------------Start of Routes-----------------------//

app.use('/user', require('./routes/user'));
app.use('/signups', require('./routes/signups'));
app.use('/points', require('./routes/points'));
app.use('/', require('./routes/basic'));
app.use('/events', require('./routes/events'));
app.use(express.static("public"));

//---------------------End of Routes-----------------------//


/**
io.on('connection', socket => {
    //console.log('a user connected!')
    socket.on('update-sheet-availability', () => {
        //console.log("selected")
    })
    socket.on('disconnect', () => {
      //console.log('user disconnected!')
    })
}) */

//Run Notification Email Update

//setInterval(notification.EmailNotificationUpdate, parseInt(process.env.NOTIFICATION_UPDATE_INTERVAL));


//Connect to DB
mongoose.connect(
    process.env.DB_CONNECTION, 
    {useNewUrlParser: true,
    useUnifiedTopology: true },
    () => { console.log('Connected to DB!')
});

http.listen(3000, () => console.log('The app is running on localhost:3000'));

