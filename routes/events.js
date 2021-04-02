const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const PortalEvent = require('../models/PortalEvent');


const authentication = require("../utility/authentication");

/** 
 * Get events page
 */
router.get('/', authentication.checkAuthenticated, async (req, res) => {
    let userData = await UserProfile.findById(req.user._id)
    res.render('events.ejs',  {user: userData})
})

/** 
 * Create new event
 */
 router.post('/create', authentication.checkAuthenticated, async (req, res) => {
    let allActiveUsers = await UserProfile.find({Approved: true}, {_id: 1})
    let data = req.body.data

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
        AccessibleBy: allActiveUsers,
        AvailableToEveryone: false        
    }).save();
    

    res.json({status: true})
})

router.get('/myevents', authentication.checkAuthenticated, async (req, res) => {

    let events = await PortalEvent.find({
        $or: [
            {AccessibleBy: req.user._id},
            {AvailableToEveryone: true}
        ]}, {AccessibleBy: 0})
    
    res.json({events: events})
})

module.exports = router;