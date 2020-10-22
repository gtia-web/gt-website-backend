const express = require('express');
const router = express.Router();
const { isLoggedIn, isVP } = require('../currentUserMiddleware');
const PointsRequest = require('../../models/PointsRequest');

// Retrieve all points for all users
router.get('/admin/points', isLoggedIn, isVP, async (req, res) => {
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
router.get('/admin/points/pending', isLoggedIn, isVP, async (req, res) => {
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
router.put('/admin/points/:id', isLoggedIn, isVP, async (req, res) => {
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
router.delete('/admin/points/:id', isLoggedIn, isVP, async (req, res) => {
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

module.exports = router;