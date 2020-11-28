const authentication = require("../utility/authentication");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const SignupSheet = require('../models/SignupSheet');
const SignupSheetResponse = require('../models/SignupSheetResponse');
const TimeSlots = require('../models/TimeSlots');
const utility = require("../utility/utility")

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

//Route to get the create new sheet page
router.get('/create', authentication.checkAuthenticated, async (req, res) => {
    res.render('signups/create-signup-form.ejs')
})

//Route to submit the created new sheet page
router.post('/create', authentication.checkAuthenticated, async (req, res) => {
    
    fields = []
    if (req.body.hasOwnProperty("fields")){
        req.body.fields.forEach((f) => {
            fields.push({
                FieldName: f.field_name,
                Required: f.isRequired
            })
        })
    }

    users = await UserProfile.find({})
    ids = []
    users.forEach((user) => {
        ids.push({
            UserId: user._id,
            DateAsigned: new Date()
        })
    })

    createdSignupSheet =  await (new SignupSheet({
        Name: req.body.sheet_name,
        Description: req.body.sheet_description,
        CanViewResponses: ids,
        CanFill: ids,
        Completed: [],
        NotCompleted: ids,
        ExpiryDate: new Date(),
        Fields: fields,
        UsesTimeSlots: req.body.hasOwnProperty("time_slots") && req.body.time_slots.length > 0
    }).save());
    
    if (req.body.hasOwnProperty("time_slots")){
        
        
        utility.asyncForEach(req.body.time_slots, async (slot) => { 
            start = new Date(slot.start_time)
            end = new Date(slot.end_time)
            length = slot.time_slot_length
            jobType = slot.job_type

            j = 1

            while(start.getTime() + j*length * 60000 <= end.getTime()) {
                res = await (new TimeSlots({
                    JobType: jobType,
                    StartTime: new Date(start.getTime() + (j-1)*length * 60000),
                    EndTime: new Date(start.getTime() + j*length * 60000),
                    AssociatedSignupSheet: createdSignupSheet._id,
                    isUsed: false
                }).save());
                j++;
            }
        })
    }

    res.json({
        redirect: "/"
    });
})

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

//------------------------------------------------ for test ------------------------------------------//

router.post('/newSheet', async (req, res) => {
    users = await UserProfile.find({})
    ids = []
    for (i=0; i < users.length; i++) {
        ids.push({
            UserId: users[i]._id,
            DateAsigned: new Date()
        })
    }
    const newCreateRequest = new SignupSheet({
        Name: req.body.name,
        CanViewResponses: ids,
        CanFill: ids,
        Completed: [],
        NotCompleted: ids,
        ExpiryDate: new Date(),
        Fields: [{
            FieldName: "Field1", 
            Required: true
        },
        {
            FieldName: "Field2", 
            Required: true
        },
        {
            FieldName: "Field3",  
            Required: true
        }]
    });

    const UpdateResponse = await newCreateRequest.save();

    res.json({
        Done: true
    });
})

router.post('/newSheet/raw', async (req, res) => {
    fields = []
    for (i=0; i < req.body.fields.length; i++) {
        fields.push({
            FieldName: req.body.fields[i].field_name,
            Required: req.body.fields[i].isRequired
        })
    }
    
    
    /**users = await UserProfile.find({})
    ids = []
    for (i=0; i < users.length; i++) {
        ids.push({
            UserId: users[i]._id,
            DateAsigned: new Date()
        })
    }*/

    createdSignupSheet =  await (new SignupSheet({
        Name: req.body.name,
        CanViewResponses: ids,
        CanFill: ids,
        Completed: [],
        NotCompleted: ids,
        ExpiryDate: new Date(),
        Fields: fields,
        UsesTimeSlots: req.body.time_slots.length > 0
    }).save());

    timeSlots = []
    BaseDate = new Date()
    for (i = 0; i < 6; i++) {
        await (new TimeSlots({
            JobType: "Setup",
            StartTime: new Date(BaseDate.getTime() + i*30 *60000),
            EndTime: new Date(BaseDate.getTime() + (i+1)*30 *60000),
            AssociatedSignupSheet: createdSignupSheet._id,
            isUsed: false
        }).save());
        
        await (new TimeSlots({
            JobType: "Breakdown",
            StartTime: new Date(BaseDate.getTime() + i*30 *60000),
            EndTime: new Date(BaseDate.getTime() + (i+1)*30 *60000),
            AssociatedSignupSheet: createdSignupSheet._id,
            isUsed: false
        }).save());

        await (new TimeSlots({
            JobType: "Main Event",
            StartTime: new Date(BaseDate.getTime() + i*30 *60000),
            EndTime: new Date(BaseDate.getTime() + (i+1)*30 *60000),
            AssociatedSignupSheet: createdSignupSheet._id,
            isUsed: false
        }).save());
    } 

    res.json({
        Done: true
    });
})


module.exports = router;
