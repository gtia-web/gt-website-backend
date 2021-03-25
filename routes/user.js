require('dotenv/config');
const authentication = require("../utility/authentication");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const PointReceipt = require('../models/PointsReceipt');
const bcrypt = require('bcrypt');
const passport = require('passport');

HashCycles = parseInt(process.env.PASSWORD_HASHING_CYCLES);

//Retrieve User Page
router.get('/', authentication.checkAuthenticated, async (req, res) => {
    userData = await UserProfile.findById(req.user._id)
    res.render('user.ejs', {user: userData})
})

//Retrieve Login Page
router.get('/login', authentication.checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

// Submit login information for login
router.post('/login', authentication.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: "/home",
    failureRedirect: "/user/login",
    failureFlash: true
}))

// Get register new account page
router.get('/register', authentication.checkNotAuthenticated, (req, res) => {
    res.render('registration.ejs')
})

// Submit new registration form
router.post('/register', async (req, res) => {
    console.log(req.body)
    
    try {
        usersWithUsername = await UserProfile.findOne({
            Username: req.body.username
        })
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            existAlready: false
        });
    }     
    
    if (usersWithUsername != null){
        res.redirect('/user/register')
    } else {

        const password = await bcrypt.hash(req.body.password, HashCycles)

        new UserProfile({
            Username: req.body.username,
            FirstName: req.body.firstname,
            LastName: req.body.lastname,
            Email: req.body.email,
            Committee: "Not Assigned",
            HashedPassword: password,
            Points: {
                SocialPoints: 0,
                WorkPoints: 0
            }
        }).save();

        res.redirect('/user/login')
    }
});

/** Log out of user
 * Must Be Logged in 
 */ 
router.get('/logout', authentication.checkAuthenticated, (req, res) => {
    req.logOut()
    res.redirect('/user/login')
})

/** Get list of student whose name or user name contains a query
 * Also takes boolean approved argument to retrieve approved accounts or pending accounts.
 * Must be logged in
 */
router.post('/list', authentication.checkAuthenticated, async (req, res) => {
    var query = req.body.query
    users = await UserProfile.find(
        { $and: [
            {
                $or: [
                    { FirstName : {$regex: query, $options : "i" }},
                    { Username : {$regex: query , $options : "i" }},
                    { LastName : {$regex: query , $options : "i" }}
                ]
            },
            {
                Approved: req.body.approved == 'true'
            }            
        ]}, 
        { Username: 1, FirstName: 1, LastName: 1, _id: 1, Email: 1 })
    res.json(users)
})

/** Get user profile details by ID
 * Must be logged in
 * Must be Admin
 */
router.post('/data', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    var id = req.body.id
    user = await UserProfile.findById(id, { HashedPassword: 0})
    res.json(user)
})

/** Get user profile from current User
 * Must be logged in
 * Must be Admin
 */
router.post('/data/self', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    var id = req.user._id
    user = await UserProfile.findById(id, { HashedPassword: 0})
    res.json(user)
})

/** Update user profile
 * Must be Logged in
 * Must be Admin
 */
router.post('/update', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    var data = req.body.data
    users = await UserProfile.findById(data.id, { HashedPassword: 0})

    previousPoint = {
        socialpoints: user.Points.SocialPoints,
        workpoints: user.Points.WorkPoints
    }

    await UserProfile.updateOne({_id: data.id  }, { $set: {
        Committee: data.committee,
        Subcommittee: data.subcommittee, 
        VPStatus: {
            isVP: data.isvp == 'true',
            isPresident: data.ispresident == 'true'
        },

        Points: {
            SocialPoints: data.socialpoints,
            WorkPoints: data.workpoints
        },
        MembershipStatus: data.membershipstatus,
        SpecialPermissions: data.specialpermissions
    }})

    if (previousPoint.workpoints != data.workpoints){
        new PointReceipt({
            Type: "Manual Admin Change",
            Status: 'Complete',
            PointsType: "work",
            SubmissionDate: Date.now(),
            ApprovedDate: Date.now(),
            Recipient: data.id,
            PointsChange: data.workpoints - previousPoint.workpoints,
            Approver: req.user._id,
            RequestDetails: {
                Description: "Manual Update From Admin",
                AssociatedEventTimeSlots: {
                    IsAssociatedToSlots: false
                },
                AssociatedEvent: {
                    IsAssociatedToEvent: false
                },
                AssociatedSheet: {
                    IsAssociatedToSheet: false
                }
            }
        }).save();
    }

    if (previousPoint.socialpoints != data.socialpoints){
        new PointReceipt({
            Type: "Manual Admin Change",
            Status: 'Complete',
            PointsType: "social",
            SubmissionDate: Date.now(),
            ApprovedDate: Date.now(),
            Recipient: data.id,
            PointsChange: data.socialpoints - previousPoint.socialpoints,
            Approver: req.user._id,
            RequestDetails: {
                Description: "Manual Update From Admin",
                AssociatedEventTimeSlots: {
                    IsAssociatedToSlots: false
                },
                AssociatedEvent: {
                    IsAssociatedToEvent: false
                },
                AssociatedSheet: {
                    IsAssociatedToSheet: false
                }
            }
        }).save();
    }

    res.json({'status': 'complete'})
})

/** Activate user profile
 * Must be Logged in
 * Must be Admin
 */
router.post('/activate', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    var data = req.body.data

    await UserProfile.updateOne({_id: data.id  }, { $set: {
        Committee: data.committee,
        Subcommittee: data.subcommittee, 
        VPStatus: {
            isVP: data.isvp == 'true',
            isPresident: data.ispresident == 'true'
        },

        Points: {
            SocialPoints: 0,
            WorkPoints: 0
        },
        MembershipStatus: data.membershipstatus,
        SpecialPermissions: data.specialpermissions,
        Approved: true
    }})

    res.json({})
})

/** Delete are user profile by ID
 * Must be Logged in
 * Must be Admin
 */
router.post('/deleteByID', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    await UserProfile.deleteOne({
        _id: req.body.id
    })
    res.json({})
})


/**canChangePermission = ["admin"]
router.patch('/changePermission', async (req, res) => {
    targetUserID = req.body.targetuserid;
    currentUserID = req.body.currentuserid;
    
    try {
        targetUser = await UserProfile.findById(targetUserID);
        currUser = await UserProfile.findById(currentUserID);
    } catch(err) {
        res.json({
            userID: null,
            changeSuccessful: false,
            runtimeErrorOccurred: true,
            OperationDenied: false,
            errorMessage: err,
        });
    }     

    if (targetUser == null) {
        res.json({
            userID: null,
            changeSuccessful: false,
            runtimeErrorOccurred: false,
            OperationDenied: true,
            errorMessage: 'Target User DNE'
        });
    } else if (currUser == null) {
        res.json({
            changeSuccessful: false,
            runtimeErrorOccurred: false,
            OperationDenied: true,
            errorMessage: 'Current User DNE'
        });
    }  else if (!utility.arrayIntersect(currUser.SpecialPermissions, canChangePermission)) {
        res.json({
            runtimeErrorOccurred: false,
            OperationDenied: true,
            errorMessage: 'Current User does not have permission to use operation'
        });
    } else {
        if (req.body.hasOwnProperty('addPermissions')) {
            for (i = 0; i < req.body.addPermissions.length; i++) {
                for (j = targetUser.SpecialPermissions.length - 1; j >= 0; j--) {
                    if(targetUser.SpecialPermissions[j] == req.body.addPermissions[i]) {
                        targetUser.SpecialPermissions.splice(j, 1);
                    }
                }
                targetUser.SpecialPermissions.push(req.body.addPermissions[i]);
            }             
        }

        if (req.body.hasOwnProperty('removePermissions')) {
            for (i = 0; i < req.body.removePermissions.length; i++) {
                for (j = targetUser.SpecialPermissions.length - 1; j >= 0; j--) {                        
                    if(targetUser.SpecialPermissions[j] == req.body.removePermissions[i]) {
                        targetUser.SpecialPermissions.splice(j, 1);
                    }
                }
            }             
        }

        try{
            const UpdateResponse = await targetUser.save();
            res.json({
                userID: UpdateResponse._id,
                changeSuccessful: true,
                runtimeErrorOccurred: false,
                OperationDenied: false
            });
        } catch(err) {
            res.json({
                userID: UpdateResponse._id,
                changeSuccessful: false,
                runtimeErrorOccurred: true,
                OperationDenied: false,
                errorMessage: err,
            });
        } 
    }
});
*/
module.exports = router;