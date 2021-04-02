const PendingEmailNotif = require('../models/PendingEmailNotification');
const FulfilledEmailNotif = require('../models/FulfilledEmailNotification');
const UserProfile = require('../models/UserProfile');
const SignupSheet = require('../models/SignupSheet');
const SignupSheetResponse = require('../models/SignupSheetResponse');
const TimeSlots = require('../models/TimeSlots');
const emailManager = require("../utility/emailManager");
const utility = require("../utility/utility")

async function EmailNotificationUpdate() {
    const app = require('express')();
    app.set('view engine', 'ejs')

    let dueEmailsNotification = await PendingEmailNotif.find({
        ExpectedDate: {"$lte": Date.now()}
    });

    utility.asyncForEach(dueEmailsNotification, async (emailNotif) => {
        let user = await UserProfile.findById(emailNotif.TargetUser)
        let signupSheet = await SignupSheet.findById(emailNotif.AssociatedSheet)
        let signupSheetResponse = await SignupSheetResponse.findById(emailNotif.AssociatedResponse)
        let timeSlots = await TimeSlots.find({
            AssociatedResponse: emailNotif.AssociatedResponse
        })

        
        app.render(emailNotif.EmailTemplate, {
            user: user,
            signupSheet: signupSheet,
            signupSheetResponse: signupSheetResponse,
            timeSlots: timeSlots
        }, (err, emailHTML) => { 
            if (err) console.log(err);

            console.log(emailHTML)

            var mailOptions = {
                from: 'GTIA Website',
                to: user.Email,
                subject: emailNotif.EmailSubject,
                html: emailHTML
            };
    
            emailManager.SendMain(mailOptions)
        });        

        await new FulfilledEmailNotif({
            TargetUser: emailNotif.TargetUser,
            AssociatedSheet: emailNotif.AssociatedSheet,
            AssociatedResponse: emailNotif.AssociatedResponse,
            ExpectedDate: emailNotif.ExpectedDate,
            FulfilledDate: Date.now(),
            EmailTemplate: emailNotif.EmailTemplate,
            EmailSubject: emailNotif.EmailSubject
        }).save();

        await PendingEmailNotif.deleteOne({
            _id: emailNotif._id
        })
    });
}

module.exports = {
    EmailNotificationUpdate
};