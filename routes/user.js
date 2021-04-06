require('dotenv/config');
const authentication = require("../utility/authentication");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const PointReceipt = require('../models/PointsReceipt');
const GlobalVariables = require('../models/GlobalVariables');
const bcrypt = require('bcrypt');
const passport = require('passport');
const uploader = require("../utility/fileUploads")
const gcManager = require("../utility/GoogleCloudManager");
const fs = require('fs')

HashCycles = parseInt(process.env.PASSWORD_HASHING_CYCLES);

//Retrieve User Page
router.get('/', authentication.checkAuthenticated, async (req, res) => {
    let userData = await UserProfile.findById(req.user._id)
    let globalVariables = await GlobalVariables.findById(process.env.GLOBAL_VARIABLES_ID)
    res.render('moon/user.ejs', {
        user: userData,
        globalVariables: globalVariables
    })
})

//Retrieve Login Page
router.get('/login', authentication.checkNotAuthenticated, (req, res) => {
    res.render('moon/login.ejs')
})

// Submit login information for login
router.post('/login', authentication.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: "/user/login/success",
    failureRedirect: "/user/login/fail",
    failureFlash: true
}))

router.get('/login/success', async (req, res) => {
    res.json({
        status: 'success'
    })

    let userData = await UserProfile.findById(req.user._id)
    let profileFilePath = 'public/' + userData.ProfilePicture.Path + '/' + userData.ProfilePicture.Filename

    if (!fs.existsSync(profileFilePath)) {
        await gcManager.getImagefromDrive({
            Path: 'public/' + userData.ProfilePicture.Path,
            Filename: userData.ProfilePicture.Filename,
            FileID: userData.ProfilePicture.GCImageID
        })
    }

    //console.log(profileFilePath)
    //console.log(req.user._id)

})

router.get('/login/fail', (req, res) => {
    res.json({
        status: 'fail'
    })
})
// Get register new account page
router.get('/register', authentication.checkNotAuthenticated, (req, res) => {
    res.render('moon/registration.ejs')
})

// Submit new registration form
router.post('/register', async (req, res) => {
    
    let usersWithUsername

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
        res.json({
            runtimeErrorOccurred: false,
            errorMessage: null,
            existAlready: true,
            redirect: null
        });
    } else {

        const password = await bcrypt.hash(req.body.password, HashCycles)
        try {
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
                },
                ProfilePicture: {
                    Filename: process.env.DEFAULT_PHOTO_NAME, 
                    Path: 'uploads/profiles/img',        
                    ImageType: process.env.DEFAULT_PHOTO_TYPE,
                    GCImageID: process.env.DEFAULT_PHOTO_GC_ID
                }
            }).save();
        } catch(err) {
            res.json({
                runtimeErrorOccurred: true,
                errorMessage: err,
                existAlready: false
            });
        }   

        res.json({
            runtimeErrorOccurred: false,
            errorMessage: null,
            existAlready: false,
            redirect: '/user/login'
        });
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
    let query = req.body.query
    let users = await UserProfile.find(
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
    let id = req.body.id
    let user = await UserProfile.findById(id, { HashedPassword: 0})
    res.json(user)
})

/** Get user profile from current User
 * Must be logged in
 * Must be Admin
 */
router.post('/data/self', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    let id = req.user._id
    let user = await UserProfile.findById(id, { HashedPassword: 0})
    res.json(user)
})

/** Update user profile
 * Must be Logged in
 * Must be Admin
 */
router.post('/update', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    let data = req.body.data
    
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


router.post('/profileimage/update', async (req, res) => {
    let upload = uploader.getImageUploader('img')
    
    upload(req, res, async function(err) {  
        if(err) {
            res.send(err)
        }
        else {
            let fileDetails = req.file
            let data = await gcManager.saveImageToDrive({
                Filename: fileDetails.filename, 
                Path: 'uploads/profiles/img',        
                ImageType: fileDetails.mimetype,
                Size: fileDetails.size
            })

            console.log(data)

            await UserProfile.updateOne({_id: req.user._id  }, { $set: {                
                ProfilePicture: {
                    Filename: fileDetails.filename, 
                    Path: 'uploads/profiles/img',        
                    ImageType: fileDetails.mimetype,
                    Size: fileDetails.size,
                    GCImageID: data.id
                }
            }})

            //uploader.deleteFile('test/testfile2')
  
            res.redirect('/user')
        }
    })

    
});

module.exports = router;