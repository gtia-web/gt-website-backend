const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const PortalEvent = require('../models/PortalEvent');


const authentication = require("../utility/authentication");

/** 
 * Get events page
 */
router.get('/', authentication.checkAuthenticated, async (req, res) => {
    userData = await UserProfile.findById(req.user._id)
    res.render('events.ejs',  {user: userData})
})

/** 
 * Create new event
 */
 router.post('/create', authentication.checkAuthenticated, async (req, res) => {
    allActiveUsers = await UserProfile.find({Approved: true}, {_id: 1})
    data = req.body.data

    new PortalEvent({
        CreatedBy: req.user._id,
        EventName: data.eventname,
        Location: data.eventlocation,
        Description: data.description,
        StartTime: new Date(data.startDate),
        EndTime: new Date(data.endDate),    
        EventType: data.eventtype,
        Notifications: {
            NotificationNote: data.notif_description,
            NotificationTimeLine: []
        },
        AccessibleBy: allActiveUsers
    }).save();
    

    res.json({status: true})
})

router.get('/myevents', authentication.checkAuthenticated, async (req, res) => {

    events = await PortalEvent.find({AccessibleBy: req.user._id}, {AccessibleBy: 0})
    
    res.json({events: events})
})

module.exports = router;