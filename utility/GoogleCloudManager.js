require('dotenv/config');
var nodemailer = require('nodemailer');
const { google } = require("googleapis");

function getClient() {
    let client = new google.auth.OAuth2 (
        process.env.GC_CLIENT_ID,
        process.env.GC_CLIENT_SECRET,
        process.env.GC_REDIRECT_URL
    )
    
    client.setCredentials({
        refresh_token: process.env.GC_REFRESH_TOKEN
    })

    return client
}

function getEmailTransporter() {

    const myAccessToken =  getClient().getAccessToken()
    
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user: process.env.GC_EMAIL,
        clientId: process.env.GC_CLIENT_ID,
        clientSecret: process.env.GC_CLIENT_SECRET,
        refreshToken: process.env.GC_REFRESH_TOKEN,
        accessToken: myAccessToken
      }
    });

    return transporter
}

function sendMain(mailOptions) {
    getEmailTransporter().sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

async function createNewGCSheet(Title, isPublic) {
    client = getClient()
    const gsapi = google.sheets({
        version: 'v4', 
        auth: client
    });

    let response = await gsapi.spreadsheets.create({
        resource: {
            properties: {
                title: Title
            }
        }
    })
    console.log(response)

    if (isPublic) {
        const fileId = response.data.spreadsheetId;
        drive = google.drive({ version: "v3", auth: client });
        await drive.permissions.create({
            resource: {
                type: "anyone",
                role: "writer"
            },
            fileId: fileId,
            fields: "id",
        });
    }

    return response
}

module.exports = {
    sendMain,
    createNewGCSheet
};