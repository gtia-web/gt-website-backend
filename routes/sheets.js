const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const PortalSheet = require('../models/PortalSheet');
const gcManager = require("../utility/GoogleCloudManager");


const authentication = require("../utility/authentication");

/** 
 * Get sheets page
 */
router.get('/', authentication.checkAuthenticated, async (req, res) => {
    let userData = await UserProfile.findById(req.user._id)
    res.render('sheets.ejs',  {user: userData})
})
/**
 * Create new sheet
 */
router.post('/create', authentication.checkAuthenticated, async (req, res) => {
    let allActiveUsers = await UserProfile.find({Approved: true}, {_id: 1});
    let data = req.body.data;
    let url = data.url;

    if (data.sheetSource == 'new') {
        url = (await gcManager.createNewGCSheet(data.sheetTitle, true)).data.spreadsheetUrl
    }

    let AccessibleBy = []
    for (let i = 0; i <  allActiveUsers.length; i++) {
        AccessibleBy.push({
            User: allActiveUsers[i]._id,
        })
    }

    console.log(AccessibleBy)

    new PortalSheet({
        CreatedBy: req.user._id,
        Title: data.sheetTitle,
        Source: data.sheetSource,
        SheetURL: url,
        Tags: data.tags,
        CreationDate: Date.now(),
        AccessibleBy: AccessibleBy,
        VisibleOn: Date.now()
    }).save();    

    res.json({status: true})
})

router.post('/view', authentication.checkAuthenticated, async (req, res) => {
    let query = req.body.query
    let sheets = await PortalSheet.find({
        $and: [
            {$or: [
                { 'AccessibleBy.User': req.user._id, VisibleOn: {$lte: Date.now()}},
                { CreatedBy: req.user._id }
            ]},
            { $or: [
                { Tags : {$regex: query, $options : "i" }},
                { Title : {$regex: query , $options : "i" }},
            ]}
        ]
    })

    for (let j = 0; j < sheets.length; j++){
        for (let i = sheets[j].AccessibleBy.length - 1; i >= 0; i--) {
            if (String(sheets[j].AccessibleBy[i].User) !=  String(req.user._id)) {
                sheets[j].AccessibleBy.splice(i, 1);
            }
        }
    }

    res.json({
        requester: req.user._id,
        sheets: sheets
    })

})

router.post('/logview', authentication.checkAuthenticated, async (req, res) => {

    let sheetID = req.body.sheetID
    let sheet = await PortalSheet.findById(sheetID, {AccessibleBy: 1})
    let access = sheet.AccessibleBy

    for (let i = access.length - 1; i >= 0; i--) {
        if (String(access[i].User) ==  String(req.user._id)) {
            access[i].OpenedDate = Date.now()
        }
    }

    await PortalSheet.findByIdAndUpdate(
        sheetID,
        { AccessibleBy: access },
        { new: true }
    );

    
    res.json({status: 'successful'})
})


module.exports = router;