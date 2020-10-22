const { Console } = require('console');
const utilityFunctions = require("../../utilityMethods");
const express = require('express');
const router = express.Router();
const UserProfile = require('../../models/UserProfile');
const Password = require('../../models/HashedPassword');
const bcrypt = require('bcrypt');
const passport = require('passport');


require('dotenv/config');
HashCycles = 10;

/**router.get('/login2', (req, res) => {
    console.log(req.body)
    passport.authenticate('local', (err, user, info) => {
        console.log(user)
        if (err) throw err
        if (!user) res.send("No User Exists")
        else {
            req.logIn(user, err => {
                if (err) throw err
                res.send('Successfully Authenticated')
                //console.log
            })
        }
    })
})**/

router.get('/login2', passport.authenticate('local', {
    successRedirect: "/User/Manage/loginSuccessful",
    failureRedirect: "/User/Manage/loginFailed"
}))

router.get('/loginSuccessful', async (req, res) => {
    res.json({
        runtimeErrorOccurred: false,
        loginStatus: true
    })
})

router.get('/loginFailed', async (req, res) => {
    res.json({
        runtimeErrorOccurred: false,
        loginStatus: false
    })
})


router.get('/login', async (req, res) => {
    try {
        usersWithUsername = await UserProfile.find({
            Username: req.body.username
        });
        if (usersWithUsername.length == 0) {
            res.json({
                runtimeErrorOccurred: false,
                exist: false
            });
        } else { 
            hashedPassord = await Password.findById(usersWithUsername[0].HashedPassword);
            
            if (await bcrypt.compare(req.body.password, hashedPassord.HashedPassword)) {
                res.json({
                    runtimeErrorOccurred: false,
                    exist: true,
                    passwordMatch: true,
                    userid: usersWithUsername[0]._id
                });
            } else {
                res.json({
                    runtimeErrorOccurred: false,
                    exist: true,
                    passwordMatch: false
                });
            }            
        }
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            exist: false,
            passwordMatch: false
        });
    }
});

router.post('/newUser', async (req, res) => {
    try {
        usersWithUsername = await UserProfile.find({
            Username: req.body.username
        })
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            existAlready: false
        });
    }     
    
    if (usersWithUsername.length > 0){
        res.json({
            pendingApproval: usersWithUsername[0].PendingApproval,
            existAlready: true,
            runtimeErrorOccurred: false,
        });
    } else {

        const password = new Password({
            HashedPassword: await bcrypt.hash(req.body.password, HashCycles)
        })

        const newUserRequest = new UserProfile({
            Username: req.body.username,
            FirstName: req.body.firstname,
            LastName: req.body.lastname,
            MiddleName: req.body.middlename,
            Committee: req.body.committee,
            HashedPassword: (await password.save())._id
        });

        try{
            const UpdateResponse = await newUserRequest.save();
            res.json({
                userID: UpdateResponse._id,
                pendingApproval: true,
                runtimeErrorOccurred: false,
                existAlready: false
            });
        } catch(err) {
            res.json({
                userID: UpdateResponse._id,
                pendingApproval: true,
                runtimeErrorOccurred: true,
                errorMessage: err,
                existAlready: false
            });
        }
    }
});

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
    }  else if (!utilityFunctions.ArrayIntersect(currUser.SpecialPermissions, canChangePermission)) {
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