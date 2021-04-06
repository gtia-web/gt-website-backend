const express = require('express');
const router = express.Router();
//const { isLoggedIn, isVP } = require('../currentUserMiddleware');
const PointsRequest = require('../models/PointsRequest');
const PointsReceipt = require('../models/PointsReceipt');
const UserProfile = require('../models/UserProfile');
const authentication = require("../utility/authentication");
var mongoose = require('mongoose');

/**
 * Retrieve all points requested by a given user
 * Can pass additional request queries for filtering:
 *  - pointStatus: [pending, approved]
 */
/**  router.get('/', authentication.checkAuthenticated, async (req, res) => {
    try {
        const { pointStatus } = req.query.pointsStatus;
        const searchParams = {
            requester: req.currentUser._id,
        }

        if (pointStatus === "pending") {
            searchParams["isPending"] = true;
        } else if (pointStatus === "approved") {
            searchParams["isPending"] = false;
        }

        const pointRequest = await PointsRequest.find(searchParams);

        return res.json({
            runtimeErrorOccurred: false,
            pointRequest
        });
    } catch (err) {
        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    }
}); **/


//Serve Point Page
router.get('/', authentication.checkAuthenticated, async (req, res) => {
    let userData = await UserProfile.findById(req.user._id)
    res.render('moon/points.ejs', {user: userData})
})

router.post('/receipts/recipient', authentication.checkAuthenticated, async (req, res) => {
    let query = req.body.query
    let type = req.body.type

    receipts = await PointsReceipt.find(
        { $and: [
            {
                $or: [
                    { Type : {$regex: query, $options : "i" }},
                    { Status : {$regex: query, $options : "i" }},
                    { "RequestDetails.Description" : {$regex: query, $options : "i" }}
                ]
            },
            {Recipient: req.user._id},
            {PointsType: type}             
    ]})  

    res.json(receipts)
});

router.post('/approver/list', authentication.checkAuthenticated, async (req, res) => {

    let approvers = await UserProfile.find(
        { $or: [
                    { "VPStatus.isVP": true }, 
                    { "VPStatus.isPresident": true }
                ]
        }, 
        {FirstName: 1, LastName: 1, _id: 1, VPStatus: 1, Committee: 1})

    res.json(approvers)
});

router.post('/request', authentication.checkAuthenticated, async (req, res) => {
    let data = req.body.data
    let date = data.date.split("-");

    new PointsReceipt({
        Type: "Points Request",
        Status: 'Pending',
        PointsType: data.pointType,
        SubmissionDate: new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2])),
        Recipient: req.user._id,
        PointsChange: data.points,
        Approver: data.approver,
        RequestDetails: {
            Description: data.description,
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

    res.json({status: 'successful'})
});

module.exports = router;