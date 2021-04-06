require('dotenv/config');
var nodemailer = require('nodemailer');
const { google } = require("googleapis");
const fs = require('fs')

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
    
    let transporter = nodemailer.createTransport({
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
    let client = getClient()
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
    //console.log(response)

    if (isPublic) {
        let fileId = response.data.spreadsheetId;
        const drive = google.drive({ version: "v3", auth: client });
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



async function saveImageToDrive(image_data) {
    let client = getClient()
    const drive = google.drive({ version: "v3", auth: client });

    var fileMetadata = {
        'name': image_data.Filename //'photo.jpg'
    };
    var media = {
        mimeType: image_data.ImageType, //'image/jpeg',
        body: fs.createReadStream('public/' + image_data.Path + '/' + image_data.Filename) //files/photo.jpg') 
    };

    let file = await drive.files.create({
        resource: fileMetadata,
        media: media
    });

    return file.data
}

async function getImagefromDrive(file_data) {
    let client = getClient()
    const drive = google.drive({ version: "v3", auth: client });

    var dest = fs.createWriteStream(file_data.Path + '/' + file_data.Filename);

    await drive.files.get({
        fileId: file_data.FileID,
        alt: 'media'
    }, {responseType: "stream"},
        function(err, res){
            res.data
            .on("end", () => {
                console.log("Done");
            })
            .on("error", err => {
                console.log("Error", err);
            })
            .pipe(dest);
    })
    
}

async function getCalenderEvents() {
    let client = getClient()
    const calendar = google.calendar({version: 'v3', auth: client});
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
            const events = res.data.items;
        if (events.length) {
            console.log('Upcoming 10 events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                //console.log(`${start} - ${event.summary}`);
                //console.log(event)
            });

            return events
        } else {
            console.log('No upcoming events found.');
        }
    }).then((res) => {
        console.log(res)
    });

    
}

getCalenderEvents()

/**getImagefromDrive({
    Path: "public/uploads/profiles/img",
    Filename: "Test.jpg",
    FileID: "1UZNisZwi5Fj2dtZ0KOtEmO3pgdmlPcB3"
})

async function Test() {
    let inp = await saveImageToDrive({
        Filename: 'avatar.jpg',       
        ImageType: 'image/jpeg',
        Path: 'uploads/profiles/img'
    })

    console.log(inp)
}

Test()**/

module.exports = {
    sendMain,
    createNewGCSheet,
    saveImageToDrive,
    getImagefromDrive
};