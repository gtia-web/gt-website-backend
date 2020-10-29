require('dotenv/config');
var nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

function getTransporter() {
    const myOAuth2Client = new OAuth2(
        process.env.MAIN_EMAIL_CLIENT_ID,
        process.env.MAIN_EMAIL_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground")
    
    myOAuth2Client.setCredentials({
        refresh_token: process.env.MAIN_EMAIL_REFRESH_TOKEN
    })
    const myAccessToken = myOAuth2Client.getAccessToken()
    
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user: process.env.MAIN_EMAIL_USERNAME,
        clientId: process.env.MAIN_EMAIL_CLIENT_ID,
        clientSecret: process.env.MAIN_EMAIL_CLIENT_SECRET,
        refreshToken: process.env.MAIN_EMAIL_REFRESH_TOKEN,
        accessToken: myAccessToken
      }
    });

    return transporter
}

function SendMain(mailOptions) {
    /**var mailOptions = {
        from: 'GTIA Website',
        to: process.env.MAIN_EMAIL_USERNAME,
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    };*/

    getTransporter().sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

module.exports = {
    SendMain
};