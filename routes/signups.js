const utilityFunctions = require("../utilityMethods");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const SignupSheet = require('../models/SignupSheet');
const SignupSheetResponse = require('../models/SignupSheetResponse');
const TimeSlots = require('../models/TimeSlots');

router.get('/active', utilityFunctions.checkAuthenticated, async (req, res) => {
    
    activeSheets = await SignupSheet.find({NotCompleted: {$elemMatch:{ UserId: req.user._id }}});
    
    res.render('active-signups.ejs', {sheets: activeSheets})
})

router.post('/active/openForm', utilityFunctions.checkAuthenticated,  async (req, res) => {    //,
    form = await SignupSheet.findById(req.body.sheet_id)  
    timeSlots = await TimeSlots.find({
        AssociatedSignupSheet: req.body.sheet_id,
        IsUsed: false
    })    
    
    res.render('active-signup-form.ejs', {
        form: form, 
        timeSlots: timeSlots
    })
})

router.post('/active/submitForm', utilityFunctions.checkAuthenticated, async (req, res) => { //
    form = await SignupSheet.findById(req.body.sheet_id) 
    
    fieldsResponses = []
    for (i = 0; i < form.Fields.length; i++) {
        fieldsResponses.push(req.body.fields[i].value)
    }    

    for (i = 0; i < form.NotCompleted.length; i++) {
        if (form.NotCompleted[i].UserId.toString() == req.user._id.toString()) {
            assignedDate = form.NotCompleted[i].DateSet
        }
    }
       
    createdSignupSheetResponse = await (new SignupSheetResponse({
        SignupSheet: req.body.sheet_id,
        FilledBy: req.user._id,
        Fields: fieldsResponses,
        AssignedDate: assignedDate,
        UsesTimeSlots: form.UsesTimeSlots,
    })).save();

    if (form.UsesTimeSlots) {
        selectedTimeSlots = req.body.selected_slot_ids

        for (i =0; i < selectedTimeSlots.length; i++) {
            await TimeSlots.updateMany({ _id: selectedTimeSlots[i]}, {
                IsUsed: true,
                AssociatedUser: req.user._id,
                AssociatedResponse: createdSignupSheetResponse._id
            })
        }
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
    
     
    res.json({
        redirect: "/signups/active"
    });
})

router.get('/create', utilityFunctions.checkAuthenticated, async (req, res) => {
    res.render('create-signup-form.ejs')
})


//------------------------------------------------ for test ------------------------------------------/:

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
    users = await UserProfile.find({})
    ids = []
    for (i=0; i < users.length; i++) {
        ids.push({
            UserId: users[i]._id,
            DateAsigned: new Date()
        })
    }

    createdSignupSheet =  await (new SignupSheet({
        Name: req.body.name,
        CanViewResponses: ids,
        CanFill: ids,
        Completed: [],
        NotCompleted: ids,
        ExpiryDate: new Date(),
        Fields: req.body.fields,
        UsesTimeSlots: true
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
