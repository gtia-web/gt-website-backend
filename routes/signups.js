const authentication = require("../utility/authentication");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const SignupSheet = require('../models/SignupSheet');
const SignupSheetResponse = require('../models/SignupSheetResponse');
const TimeSlots = require('../models/TimeSlots');
const utility = require("../utility/utility");

// Route to get list of active sheets
router.get('/active', authentication.checkAuthenticated, async (req, res) => {
    
    activeSheets = await SignupSheet.find({NotCompleted: {$elemMatch:{ UserId: req.user._id }}}) 
    res.render('signups/active-signups.ejs', {sheets: activeSheets})
})

// Route to get an active sheet
router.post('/active', authentication.checkAuthenticated,  async (req, res) => { 

    form = await SignupSheet.findById(req.body.sheet_id)  
    timeSlots = await TimeSlots.find({
        AssociatedSignupSheet: req.body.sheet_id,
        IsUsed: false
    })    
    
    res.render('signups/active-signup-form.ejs', {
        form: form, 
        timeSlots: timeSlots
    })
})

//Route to submit a response to an active sheet
router.post('/active/submitForm', authentication.checkAuthenticated, async (req, res) => { 
    
    form = await SignupSheet.findById(req.body.sheet_id) 
    fieldsResponses = []

    if (form.hasOwnProperty("Fields")) {
        form.Fields.forEach((f)  => fieldsResponses.push(f.value))
    }

    assignedDate = null
    if (form.hasOwnProperty("NotCompleted")) {
        form.NotCompleted.forEach((u)  => {
            if (u.UserId.toString() == req.user._id.toString()) {
                assignedDate = u.DateSet
            }
        })
    }
       
    createdSignupSheetResponse = await (new SignupSheetResponse({
        SignupSheet: req.body.sheet_id,
        FilledBy: req.user._id,
        Fields: fieldsResponses,
        AssignedDate: assignedDate,
        UsesTimeSlots: form.UsesTimeSlots,
    })).save();

    if (form.UsesTimeSlots && req.body.hasOwnProperty("selected_slot_ids")) {
        selectedTimeSlots = req.body.selected_slot_ids
        utility.asyncForEach(selectedTimeSlots, async (slot)=> {
            await TimeSlots.updateMany({ _id: slot}, {
                IsUsed: true,
                AssociatedUser: req.user._id,
                AssociatedResponse: createdSignupSheetResponse._id
            })
        });        
    }

        
    await SignupSheet.updateOne({_id: req.body.sheet_id},
        {$pull : {NotCompleted: { 
            UserId: req.user._id
        }}, 
        $push : {Completed: { 
            UserId: req.user._id,
            DateCompleted: new Date()
        }}
    })

    await SignupSheet.updateOne({_id: req.body.sheet_id},
        {$pull : {NotCompleted: { 
            UserId: req.user._id
        }}, 
        $push : {Completed: { 
            UserId: req.user._id,
            DateCompleted: new Date()
        }}
    })    
     
    res.json({
        redirect: "/signups/active"
    });
})


/*
router.get('/view', authentication.checkAuthenticated, async (req, res) => {
    
    activeSheets = await SignupSheet.find({CanFill: {$elemMatch:{ UserId: req.user._id }}}) 
    var timeSlotAvail = new Map()
    await utility.asyncForEach(activeSheets, async (sheet) => {
        timeSlotAvail.set(sheet._id.toString(), new Map())

        timeSlots = await TimeSlots.find({AssociatedSignupSheet: sheet._id}) 
        timeSlopMap = new Map()
        timeSlots.forEach((ts) => {
            if (!timeSlopMap.has(ts.AssociatedTimeSlotFieldNumber)) timeSlopMap.set(ts.AssociatedTimeSlotFieldNumber, [])
            timeSlopMap.get(ts.AssociatedTimeSlotFieldNumber).push(ts)
        })

        for (let key of timeSlopMap.keys()) {
            timeSlotAvail.get(sheet._id.toString()).set(key, new Map())
            timeSlopMap.get(key).forEach((ts) => {
                if (!timeSlotAvail.get(sheet._id.toString()).get(key).has(ts.StartTime)) {
                    timeSlotAvail.get(sheet._id.toString()).get(key).set(ts.StartTime, {
                        avail: 0,
                        used: 0,
                        length: ts.Length
                    })
                }
                if (ts.IsUsed) timeSlotAvail.get(sheet._id.toString()).get(key).get(ts.StartTime).used += 1;
                else timeSlotAvail.get(sheet._id.toString()).get(key).get(ts.StartTime).avail += 1;
            })
        }
    })

    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var month = new Array(12);
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";

    res.render('new/view-sheets.ejs', {
        sheets: activeSheets,
        timeSlotExtraData: {
            timeSlotSort: (a, b) => {
                if (a.getTime() < b.getTime()) return -1
                else if (a.getTime() > b.getTime()) return 1;
                else  return 0;
            },
            weekday: weekday,
            month: month,
            slotAvailability: timeSlotAvail
        }
    })

    res.render('new/view-sheets.ejs', {
        sheets: activeSheets,
        timeSlotExtraData: {
            timeSlotSort: (a, b) => {
                if (a.getTime() < b.getTime()) return -1
                else if (a.getTime() > b.getTime()) return 1;
                else  return 0;
            },
            weekday: weekday,
            month: month,
            slotAvailability: timeSlotAvail
        }
    })

})*/

//Route to get the create new sheet page
router.get('/create', authentication.checkAuthenticated, async (req, res) => {
    //res.render('signups/create-signup-form.ejs')
    userData = await UserProfile.findById(req.user._id)
    res.render('create-signup-form.ejs', {user: userData})
})

//Route to submit the created new sheet page
router.post('/create', authentication.checkAuthenticated, async (req, res) => {
    
    TextFields = []
    OptionsFields = []
    TimeSlotsFields = []

    if (req.body.hasOwnProperty("fields")){
        req.body.fields.forEach((f) => {
            if (f.type == 'text') {
                TextFields.push({
                    Question: f.question,
                    Required: (f.is_required == 'true'),
                    FieldNumber: f.field_number
                })
            } else if (f.type == 'options') {
                options = []
                f.options.forEach((o, i) => {
                    options.push({
                        OptionNumber: i+1, 
                        Option: o
                    })
                })
                OptionsFields.push({
                    Question: f.question,
                    Required: (f.is_required == 'true'),
                    FieldNumber: f.field_number,
                    ChooseMultiple: f.choose_multiple,
                    Options: options
                })
            } else if (f.type == 'time-slot'){
                TimeSlotsFields.push({
                    ShortDecrip: f.description,
                    FieldNumber: f.field_number,
                    JobType: f.job_type,
                    Required: (f.is_required == 'true'),
                    StartTime: new Date(f.start_time),
                    EndTime: new Date(f.end_time),
                    Length: parseInt(f.slot_length)
                })
            }
            
            
        })
    }

    can_view_ids = []
    req.body.can_view.forEach((id) => {
        can_view_ids.push({
            UserId: id,
            DateAsigned: new Date()
        })
    })

    can_fill_ids = []
    req.body.can_fill.forEach((id) => {
        can_fill_ids.push({
            UserId: id,
            DateAsigned: new Date()
        })
    })

    createdSignupSheet =  await (new SignupSheet({
        Name: req.body.sheet_name,
        Description: req.body.sheet_description,
        CanViewResponses: can_view_ids,
        CanFill: can_fill_ids,
        Completed: [],
        NotCompleted: can_fill_ids,
        SendEmailNotifications: req.body.send_notifications,
        ExpiryDate: new Date(req.body.expiration_date),
        TextFields: TextFields,
        OptionsFields: OptionsFields,
        TimeSlotsFields: TimeSlotsFields
    }).save());    

    utility.asyncForEach(TimeSlotsFields, async (slot) => { 
        var start = new Date(slot.StartTime)
        var end = new Date(slot.EndTime)
        var length = slot.Length
        var jobType = slot.JobType

        j = 1
        while(start.getTime() + j*length * 60000 <= end.getTime()) {
            await (new TimeSlots({
                JobType: jobType,
                StartTime: new Date(start.getTime() + (j-1)*length * 60000),
                EndTime: new Date(start.getTime() + j*length * 60000),
                AssociatedSignupSheet: createdSignupSheet._id,
                isUsed: false,
                AssociatedTimeSlotFieldNumber: slot.FieldNumber,
                Length: length
            }).save());
            j++;
        }
    })
    
    console.log('complete creation')
    res.json({
        redirect: "/"
    });
})

/**router.post('/user/list', authentication.checkAuthenticated, async (req, res) => {
    var query = req.body.query
    users = await UserProfile.find(
        { $or: [
            { FirstName : {$regex: query, $options : "i" }},
            { Username : {$regex: query , $options : "i" }},
            { LastName : {$regex: query , $options : "i" }}
        ]}, 
        { Username: 1, FirstName: 1, LastName: 1, _id: 1 })
    res.json(users)
})**/

//Route to view responses to sheets you can view
router.get('/view/mySignupSheets', authentication.checkAuthenticated, async (req, res) => {

    mySignupSheets = await SignupSheet.find({CanViewResponses: {$elemMatch:{ UserId: req.user._id }}})
    res.render('signups/view-my-signup-sheets.ejs', {sheets: mySignupSheets})
})

//Route to view your responses to sheets you filled
router.get('/view/myResponses', authentication.checkAuthenticated, async (req, res) => {

    myResponses = await SignupSheetResponse.find({FilledBy: req.user._id })
    res.render('signups/view-my-signup-sheets.ejs', {responses: myResponses})
})


module.exports = router;
