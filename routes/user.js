require('dotenv/config');
const authentication = require("../utility/authentication");
const utility = require("../utility/utility");
const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const bcrypt = require('bcrypt');
const passport = require('passport');

HashCycles = parseInt(process.env.PASSWORD_HASHING_CYCLES);

// Get login page
router.get('/login', authentication.checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

// Submit login information for login
router.post('/login', authentication.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true
}))

// Get register new account page
router.get('/register', authentication.checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

// Submit new registration form
router.post('/register', async (req, res) => {
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
            MiddleName: req.body.middlename,
            Committee: req.body.committee,
            HashedPassword: password
        }).save();

        res.redirect('/user/login')
    }
});

// Log out of user
router.post('/logout', (req, res) => {
    req.logOut()
    res.redirect('/user/login')
})


router.post('/list', async (req, res) => {
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
                PendingApproval: req.body.pending == 'true'
            }            
        ]}, 
        { Username: 1, FirstName: 1, LastName: 1, _id: 1, Email: 1 })
    res.json(users)
})

router.post('/data', async (req, res) => {
    var id = req.body.id
    users = await UserProfile.findById(id, { HashedPassword: 0})
    res.json(users)
})

canChangePermission = ["admin"]
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
module.exports = router;