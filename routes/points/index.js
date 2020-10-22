const express = require('express');
const router = express.Router();
const { isLoggedIn, isVP } = require('../currentUserMiddleware');
const PointsRequest = require('../../models/PointsRequest');

// Route to return point requests needed to be approved
router.get('/pending', isLoggedIn, isVP, async (req, res) => {
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

// Route for user to submit a new point request
router.post('/', isLoggedIn, async (req, res) => {
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

// Approve a given point request
router.patch('/:id', isLoggedIn, isVP, async (req, res) => {
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

module.exports = router;