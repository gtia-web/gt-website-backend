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
    userData = await UserProfile.findById(req.user._id)
    res.render('points.ejs', {user: userData})
})


// Route for user to submit a new point request
router.post('/', authentication.checkAuthenticated, async (req, res) => {
    const { pointsType, eventName, description, dateOfEvent, shiftsCovered } = req.body;

    try {
        const requestDetails = { eventName, description, dateOfEvent, shiftsCovered };
        const pointRequest = await PointsRequest.create({
            requester: req.currentUser._id,
            requestDetails,
            pointsType
        });

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
});

// Retrieve details about an point request made by the current user
router.get('/:id', authentication.checkAuthenticated, async (req, res) => {
    try {
        const searchParams = {
            requester: req.currentUser._id,
            _id: req.params.id,
        }

        const pointRequest = await PointsRequest.find({ searchParams });

        // No points request found for the given user and pointRequest id
        if (!pointRequest) {
            return res.json({
                runtimeErrorOccurred: true,
                errorMessage: "Point Request could not be found"
            });
        }

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
});

// User wants to update their point request
router.put('/:id', authentication.checkAuthenticated, async (req, res) => {
    try {
        const pointRequest = await PointsRequest.find({
            requester: req.currentUser._id,
            _id: req.params.id,
        });

        // No points request found for the given user and pointRequest id
        if (!pointRequest) {
            return res.json({
                runtimeErrorOccurred: true,
                errorMessage: "Point Request could not be found"
            });
        }

        // Point has already been approved. The user cannot edit it
        if (!pointRequest.isPending) {
            return res.json({
                runtimeErrorOccurred: true,
                errorMessage: "Point Request has already been approved. You cannot edit it"
            });
        }

        const { pointsType, eventName, description, dateOfEvent, shiftsCovered } = req.body;
        const requestDetails = { eventName, description, dateOfEvent, shiftsCovered };
        const updatedPointRequest = await PointsRequest.findByIdAndUpdate(
            req.params.id,
            { requestDetails, pointsType },
            { new: true }
        );

        return res.json({
            runtimeErrorOccurred: false,
            updatedPointRequest
        });


    } catch (err) {
        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    }
});

router.delete("/:id", authentication.checkAuthenticated, async (req, res) => {
    try {
        const pointRequest = await PointsRequest.find({
            requester: req.currentUser._id,
            _id: req.params.id,
        });

        // Cannot delete a point request if it has already been approved
        if (!pointRequest.isPending) {
            return res.json({
                runtimeErrorOccurred: true,
                errorMessage: "Point Request has already been approved. You cannot delete it"
            });
        }

        await pointRequest.remove();
        return res.json({
            runtimeErrorOccurred: false
        });
    } catch (err) {
        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    }
});

// Retrieve all points for all users
router.get('/admin/points', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    try {
        const pendingPoints = await PointsRequest.find({});

        return res.json({
            runtimeErrorOccurred: false,
            pendingPoints
        });
    } catch (err) {
        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    }
});

// Route to return point requests needed to be approved
router.get('/admin/points/pending', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    try {
        const pendingPoints = await PointsRequest.find({
            isPending: true,
        });

        return res.json({
            runtimeErrorOccurred: false,
            pendingPoints
        });
    } catch (err) {
        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    }
});

// Approve a given point request
router.put('/admin/points/:id', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    const { approvedDate, pointsGiven } = req.body;
    try {
        const updatePoint = {
            approver: req.currentUser._id,
            approvedDate,
            pointsGiven,
            isPending: false,
        }

        const pointRequest = await PointsRequest.findByIdAndUpdate(req.query.id, updatePoint, { new: true });
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
});

// Route for admin to delete a point request (even approved)
router.delete('/admin/points/:id', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {
    try {
        await PointsRequest.findByIdAndDelete(req.params.id);
        return res.json({
            runtimeErrorOccurred: false
        });
    } catch (err) {
        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    }
});

router.post('/receipts/recipient', authentication.checkAuthenticated, async (req, res) => {
    query = req.body.query
    type = req.body.type

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

    approvers = await UserProfile.find(
        { $or: [
                    { "VPStatus.isVP": true }, 
                    { "VPStatus.isPresident": true }
                ]
        }, 
        {FirstName: 1, LastName: 1, _id: 1, VPStatus: 1, Committee: 1})

    res.json(approvers)
});

router.post('/request', authentication.checkAuthenticated, async (req, res) => {
    data = req.body.data

    new PointsReceipt({
        Type: "Points Request",
        Status: 'Pending',
        PointsType: data.pointType,
        SubmissionDate: new Date(data.date),
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


    approvers = await UserProfile.find(
        { $or: [
                    { "VPStatus.isVP": true }, 
                    { "VPStatus.isPresident": true }
                ]
        }, 
        {FirstName: 1, LastName: 1, _id: 1, VPStatus: 1, Committee: 1})

    res.json(approvers)
});

module.exports = router;