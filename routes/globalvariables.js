require('dotenv/config');
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const PortalEvent = require('../models/PortalEvent');
const GlobalVariables = require('../models/GlobalVariables');


const authentication = require("../utility/authentication");
const { update } = require('../models/GlobalVariables');

/** 
 * Get global variables
 */
router.get('/get', authentication.checkAuthenticated, async (req, res) => {
    globalVariables = await GlobalVariables.findById(process.env.GLOBAL_VARIABLES_ID)
    res.json({
        globalVariables: globalVariables
    })
})

/** 
 * Create new global variable profile
 */
router.post('/create', async (req, res) => {
    data = req.body.data

    await new GlobalVariables({
        SocialPointsRequirement: data.socialPointReq,
        WorkPointsRequirement: data.workPointReqs,
        Semester: data.currSem,
        SemesterStart: new Date(data.startSem),
        SemesterEnd: new Date(data.endSem),
        GeneralMeetingTime: data.gmTime,
        GeneralMeetingDay: data.gmDay,
        AutoGeneralMeetingEvent: data.gmAutoEvent
    }).save();    

    res.json({status: true})
})

router.post('/update', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {    
    let data = req.body.data
    let gvPrevious = await GlobalVariables.findById(process.env.GLOBAL_VARIABLES_ID)

    await GlobalVariables.updateOne({ _id: process.env.GLOBAL_VARIABLES_ID }, {
        SocialPointsRequirement: data.socialPointReq,
        WorkPointsRequirement: data.workPointReq,
        Semester: data.currSem,
        SemesterStart: new Date(data.startSem),
        SemesterEnd: new Date(data.endSem),
        GeneralMeetingTime: data.gmTime,
        GeneralMeetingDay: data.gmDay,
        AutoGeneralMeetingEvent: data.gmAutoEvent
    })
    let gvUpdate = await GlobalVariables.findById(process.env.GLOBAL_VARIABLES_ID)

    if (gvUpdate.GeneralMeetingTime != gvPrevious.GeneralMeetingTime ||
        gvUpdate.GeneralMeetingDay != gvPrevious.GeneralMeetingDay ||
        gvUpdate.AutoGeneralMeetingEvent != gvPrevious.AutoGeneralMeetingEvent ||
        gvUpdate.SemesterStart != gvPrevious.SemesterStart ||
        gvUpdate.SemesterEnd != gvPrevious.SemesterEnd) {
        
        await PortalEvent.deleteMany({
            EventType: 'General Meeting', 
            StartTime: {
                $gte: Date.now() - 200000000
            }
        }) 

        if (gvUpdate.AutoGeneralMeetingEvent) {
            allActiveUsers = await UserProfile.find({Approved: true}, {_id: 1})
            startSem = new Date(gvUpdate.SemesterStart)
            endSem = new Date(gvUpdate.SemesterEnd)
            gmDayOfWeek = DayMap(gvUpdate.GeneralMeetingDay)
            gmTime = gvUpdate.GeneralMeetingTime.split(':')

            gmEvents = []

            let date = startSem.getTime() < Date.now() ? new Date(Date.now()) : startSem

            while (true) {                
                
                nextGM = new Date(date.getTime())
                nextGM.setDate(nextGM.getDate() + ((7 + gmDayOfWeek - date.getDay()) % 7));
                nextGM.setHours(parseInt(gmTime[0]))
                nextGM.setMinutes(parseInt(gmTime[1]))

                

                if (nextGM.getTime() > endSem.getTime()) {
                    break;
                } else {
                    location = 'Skiles' //Add to model

                    gmEvents.push({
                        CreatedBy: req.user._id,
                        EventName: "General Meeting",
                        Location: location,
                        Description: "GTIA General Meeting",
                        StartTime: nextGM,
                        EndTime: nextGM,  //Change to have correct time
                        EventType: 'General Meeting',
                        AccessibleBy: allActiveUsers,
                        AvailableToEveryone: true
                    })

                    date = new Date(nextGM.getTime())
                    date.setDate(date.getDate() + 1);
                }

                
            }

            await PortalEvent.insertMany(gmEvents)

            //TEST THIS FUNCTIONALITY

        }
    }

    res.json({status: true})
})

function DayMap(day){
    switch(day.toLowerCase()) {
        case 'sunday':
            return 0;
        case 'monday':
            return 1;
        case 'tuesday':
            return 2;
        case 'wednesday':
            return 3;
        case 'thursday':
            return 4;        
        case 'friday':
            return 5;    
        case 'saturday':
            return 6;
        default:
            return -1;
      }
}

module.exports = router;