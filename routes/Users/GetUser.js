const { Console } = require('console');
const utilityFunctions = require("../../utilityMethods");
const express = require('express');
const router = express.Router();
const UserProfile = require('../../models/UserProfile');

router.get('/byID', async (req, res) => {

    try {
        user = await UserProfile.findById(req.body.userid);
        if (user == null) {
            res.json({
                runtimeErrorOccurred: false,
                exist: false
            });
        } else {            
            res.json({
                runtimeErrorOccurred: false,
                exist: true,
                userProfile: user
            });
        }
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            exist: false
        });
    }   
});

canByUsername = ["admin"]
router.get('/byUsername', async (req, res) => {
    
    try {
        currUser = await UserProfile.findById(req.body.currentuserid)
        console.log(utilityFunctions.ArrayIntersect(currUser.SpecialPermissions, canByUsername))
        if (!utilityFunctions.ArrayIntersect(currUser.SpecialPermissions, canByUsername)) {
            console.log('here1')
            res.json({
                runtimeErrorOccurred: false,
                OperationDenied: true,
                errorMessage: 'Current User does not have permission to use operation'
            });
            return 
        }
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            exist: false
        });
    } 

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
            res.json({
                runtimeErrorOccurred: false,
                exist: true,
                userProfile: usersWithUsername[0]
            });
        }
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            exist: false
        });
    } 
});

canByCommittee = ["admin"]
router.get('/byCommittee', async (req, res) => {
    
    currentUserID = req.body.currentuserid;
    try {
        currUser = await UserProfile.findById(currentUserID);
        if (!utilityFunctions.ArrayIntersect(currUser.SpecialPermissions, canByCommittee)) {
            res.json({
                runtimeErrorOccurred: false,
                OperationDenied: true,
                errorMessage: 'Current User does not have permission use operation'
            });
            return
        }
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            exist: false
        });
    } 

    try {
        usersWithCommittee = await UserProfile.find({
            Committee: req.body.committee
        });
        res.json({
            runtimeErrorOccurred: false,
            userProfile: usersWithCommittee
        });
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    } 
});

canAll = ["admin"]
router.get('/all', async (req, res) => {
    currentUserID = req.body.currentuserid;
    try {
        currUser = await UserProfile.findById(currentUserID);
        if (!utilityFunctions.ArrayIntersect(currUser.SpecialPermissions, canAll)) {
            res.json({
                runtimeErrorOccurred: false,
                OperationDenied: true,
                errorMessage: 'Current User does not have permission to use operation'
            });
            return
        }
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            exist: false
        });
    } 

    try {
        usersAll = await UserProfile.find();
        
        res.json({
            runtimeErrorOccurred: false,
            userProfile: usersAll
        });
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    } 
});

canAllVPs = ["admin"]
router.get('/allVPs', async (req, res) => {

    currentUserID = req.body.currentuserid;
    try {
        currUser = await UserProfile.findById(currentUserID);
        if (!utilityFunctions.ArrayIntersect(currUser.SpecialPermissions, canAllVPs)) {
            res.json({
                runtimeErrorOccurred: false,
                OperationDenied: true,
                errorMessage: 'Current User does not have permission to use operation'
            });
            return
        }
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            exist: false
        });
    } 

    try {
        usersAll = await UserProfile.find({
            VPStatus: {
                isVP: true
            }
        });
        res.json({
            runtimeErrorOccurred: false,
            userProfile: usersAll
        });
    } catch(err) {
        res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    }     
});

module.exports = router;