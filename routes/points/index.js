const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../currentUserMiddleware');
const PointsRequest = require('../../models/PointsRequest');

/**
 * Retrieve all points requested by a given user
 * Can pass additional request queries for filtering:
 *  - pointStatus: [pending, approved]
 */
router.get('/', isLoggedIn, async (req, res) => {
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

// Retrieve details about an point request made by the current user
router.get('/:id', isLoggedIn, async (req, res) => {
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
router.put('/:id', isLoggedIn, async (req, res) => {
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

router.delete("/:id", isLoggedIn, async (req, res) => {
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

module.exports = router;