const utilityFunctions = require("../utilityMethods");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const SignupSheet = require('../models/SignupSheet');
const SignupSheetResponse = require('../models/SignupSheetResponse');

router.get('/active', utilityFunctions.checkAuthenticated, async (req, res) => {
    
    activeSheets = await SignupSheet.find({NotCompleted: {$elemMatch:{ UserId: req.user._id }}});
    
    res.render('activeSignups.ejs', {sheets: activeSheets})
})

router.post('/active/openForm', utilityFunctions.checkAuthenticated, async (req, res) => {    
    form = await SignupSheet.findById(req.body.id)    
    res.render('activeSignupForm.ejs', {form: form})
})

router.post('/active/submitForm', utilityFunctions.checkAuthenticated, async (req, res) => {    
    form = await SignupSheet.findById(req.body.sheet_id) 
    
    fields_responses = []
    for (i = 0; i < form.Fields.length; i++) {
        fields_responses.push(req.body[i])
    }

    for (i = 0; i < form.NotCompleted.length; i++) {
        if (form.NotCompleted[i].UserId.toString() == req.user._id.toString()) {
            assignedDate = form.NotCompleted[i].DateSet
        }
    }

    await (new SignupSheetResponse({
        SignupSheet: req.body.sheet_id,
        FilledBy: req.user._id,
        Fields: fields_responses,
        AssignedDate: assignedDate
    })).save();

    await SignupSheet.updateOne({_id: req.body.sheet_id},
        {$pull : {NotCompleted: { 
            UserId: req.user._id
        }}, 
        $push : {Completed: { 
            UserId: req.user._id,
            DateCompleted: new Date()
        }}
    })
     
    res.redirect("/")
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
            ResponseType: "text",  
            Required: true
        },
        {
            FieldName: "Field2",
            ResponseType: "text",  
            Required: true
        },
        {
            FieldName: "Field3",
            ResponseType: "text",  
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
    const newCreateRequest = new SignupSheet({
        Name: req.body.name,
        CanViewResponses: ids,
        CanFill: ids,
        Completed: [],
        NotCompleted: ids,
        ExpiryDate: new Date(),
        Fields: req.body.fields
    });

    const UpdateResponse = await newCreateRequest.save();

    res.json({
        Done: true
    });
})

router.get('/active2', utilityFunctions.checkAuthenticated, async (req, res) => {
    users = await UserProfile.find({})

    id = users[0]._id
    activeSheets = await SignupSheet.find({NotCompleted: {$elemMatch:{ UserId: id }}});
    console.log(activeSheets.length)

    res.json({
        Done: true
    });
})

module.exports = router;
