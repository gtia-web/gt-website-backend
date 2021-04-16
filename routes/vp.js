const express = require('express');
const router = express.Router();
//const { isLoggedIn, isVP } = require('../currentUserMiddleware');
const PointsReceipt = require('../models/PointsReceipt');
const UserProfile = require('../models/UserProfile');
const authentication = require('../utility/authentication');
var mongoose = require('mongoose');


//Serve Point Page
router.get('/', authentication.checkAuthenticated, async (req, res) => {
  userData = await UserProfile.findById(req.user._id);

  res.render('moon/vp.ejs', { user: userData });
});

// Route for user to submit a new point request
router.post('/', authentication.checkAuthenticated, async (req, res) => {
  const {
    pointsType,
    eventName,
    description,
    dateOfEvent,
    shiftsCovered,
  } = req.body;

  try {
    const requestDetails = {
      eventName,
      description,
      dateOfEvent,
      shiftsCovered,
    };
    const pointRequest = await PointsRequest.create({
      requester: req.currentUser._id,
      requestDetails,
      pointsType,
    });

    return res.json({
      runtimeErrorOccurred: false,
      pointRequest,
    });
  } catch (err) {
    return res.json({
      runtimeErrorOccurred: true,
      errorMessage: err,
    });
  }
});

// Retrieve details about an point request made by the current user
router.get('/:id', authentication.checkAuthenticated, async (req, res) => {
  try {
    const searchParams = {
      requester: req.currentUser._id,
      _id: req.params.id,
    };

    const pointRequest = await PointsRequest.find({ searchParams });

    // No points request found for the given user and pointRequest id
    if (!pointRequest) {
      return res.json({
        runtimeErrorOccurred: true,
        errorMessage: 'Point Request could not be found',
      });
    }

    return res.json({
      runtimeErrorOccurred: false,
      pointRequest,
    });
  } catch (err) {
    return res.json({
      runtimeErrorOccurred: true,
      errorMessage: err,
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
        errorMessage: 'Point Request could not be found',
      });
    }

    // Point has already been approved. The user cannot edit it
    if (!pointRequest.isPending) {
      return res.json({
        runtimeErrorOccurred: true,
        errorMessage:
          'Point Request has already been approved. You cannot edit it',
      });
    }

    const {
      pointsType,
      eventName,
      description,
      dateOfEvent,
      shiftsCovered,
    } = req.body;
    const requestDetails = {
      eventName,
      description,
      dateOfEvent,
      shiftsCovered,
    };
    const updatedPointRequest = await PointsRequest.findByIdAndUpdate(
      req.params.id,
      { requestDetails, pointsType },
      { new: true }
    );

    return res.json({
      runtimeErrorOccurred: false,
      updatedPointRequest,
    });
  } catch (err) {
    return res.json({
      runtimeErrorOccurred: true,
      errorMessage: err,
    });
  }
});

router.delete('/:id', authentication.checkAuthenticated, async (req, res) => {
  try {
    const pointRequest = await PointsRequest.find({
      requester: req.currentUser._id,
      _id: req.params.id,
    });

    // Cannot delete a point request if it has already been approved
    if (!pointRequest.isPending) {
      return res.json({
        runtimeErrorOccurred: true,
        errorMessage:
          'Point Request has already been approved. You cannot delete it',
      });
    }

    await pointRequest.remove();
    return res.json({
      runtimeErrorOccurred: false,
    });
  } catch (err) {
    return res.json({
      runtimeErrorOccurred: true,
      errorMessage: err,
    });
  }
});

// Retrieve all points for all users
router.get(
  '/admin/points',
  authentication.checkAuthenticated,
  authentication.checkAuthenticatedAdmin,
  async (req, res) => {
    try {
      const pendingPoints = await PointsRequest.find({});

      return res.json({
        runtimeErrorOccurred: false,
        pendingPoints,
      });
    } catch (err) {
      return res.json({
        runtimeErrorOccurred: true,
        errorMessage: err,
      });
    }
  }
);

// Route to return point requests needed to be approved
router.get(
  '/admin/points/pending',
  authentication.checkAuthenticated,
  authentication.checkAuthenticatedAdmin,
  async (req, res) => {
    try {
      const pendingPoints = await PointsRequest.find({
        isPending: true,
      });

      return res.json({
        runtimeErrorOccurred: false,
        pendingPoints,
      });
    } catch (err) {
      return res.json({
        runtimeErrorOccurred: true,
        errorMessage: err,
      });
    }
  }
);

// Approve a given point request
router.post('/points/approve', authentication.checkAuthenticated, authentication.checkAuthenticatedAdmin, async (req, res) => {

    let recieptID = req.body.recieptID
    let reciept = await PointsReceipt.findById(recieptID)    

    try {
        let updateReciept = {
            Status: "Complete",
            ApprovedDate: new Date(Date.now()),
        };

        await PointsReceipt.findByIdAndUpdate(recieptID, updateReciept);
        let pointType = reciept.PointsType
        let pointChange = reciept.PointsChange
        let recipient = reciept.Recipient

        let recipientUser = await UserProfile.findById(recipient);
        let currWorkPoints = recipientUser.Points.WorkPoints
        let currSocialPoints = recipientUser.Points.SocialPoints

        if (pointType == 'work') {
            let updatePoints = {
                Points: {
                    WorkPoints: currWorkPoints + pointChange,
                    SocialPoints: currSocialPoints
                }
            }
            await UserProfile.findByIdAndUpdate(recipient, updatePoints)

        } else if (pointType == 'social') {
            let updatePoints = {
                Points: {
                    SocialPoints: currSocialPoints + pointChange,
                    WorkPoints: currWorkPoints
                }
            }
            await UserProfile.findByIdAndUpdate(recipient, updatePoints)
        }


        return res.json({
          runtimeErrorOccurred: false,
          status: 'succesful',
        });
      } catch (err) {
        return res.json({
          runtimeErrorOccurred: true,
          errorMessage: err,
          status: 'failed',
        });
      }
  }
);

// Route for admin to delete a point request (even approved)
router.delete(
  '/admin/points/:id',
  authentication.checkAuthenticated,
  authentication.checkAuthenticatedAdmin,
  async (req, res) => {
    try {
      await PointsRequest.findByIdAndDelete(req.params.id);
      return res.json({
        runtimeErrorOccurred: false,
      });
    } catch (err) {
      return res.json({
        runtimeErrorOccurred: true,
        errorMessage: err,
      });
    }
  }
);

router.post('/receipts/recipient',
  authentication.checkAuthenticated,
  async (req, res) => {
    query = req.body.query;
    type = req.body.type;
    status = req.body.status;

    receipts = await PointsReceipt.find({
        $and: [
            { $or: [
                { Type: { $regex: query, $options: 'i' } },
                { Status: { $regex: query, $options: 'i' } },
                { 'RequestDetails.Description': { $regex: query, $options: 'i' } },
            ]},
            { Approver: req.user._id },
            { PointsType: type },
            { Status: status },
        ],
    });

    let ids = [];

    for (let i = 0; i < receipts.length; i++) {
        ids.push(receipts[i].Recipient)
    }
    let users = await UserProfile.find({
        _id: { $in: ids },
    });

    res.json({
        receipts: receipts,
        users: users
    });
  }
);

router.post('/approver/list',
    authentication.checkAuthenticated,
    async (req, res) => {
        approvers = await UserProfile.find(
            { $or: [{ 'VPStatus.isVP': true }, { 'VPStatus.isPresident': true }] },
            { FirstName: 1, LastName: 1, _id: 1, VPStatus: 1, Committee: 1 }
        );

        res.json(approvers);
  }
);

router.post('/request', authentication.checkAuthenticated, async (req, res) => {
    data = req.body.data;
    date = data.date.split('-');

    new PointsReceipt({
        Type: 'Points Request',
        Status: 'Pending',
        PointsType: data.pointType,
        SubmissionDate: new Date(
            parseInt(date[0]),
            parseInt(date[1]) - 1,
            parseInt(date[2])
        ),
        Recipient: req.user._id,
        PointsChange: data.points,
        Approver: data.approver,
        RequestDetails: {
            Description: data.description,
            AssociatedEventTimeSlots: {
                IsAssociatedToSlots: false,
            },
            AssociatedEvent: {
                IsAssociatedToEvent: false,
            },
            AssociatedSheet: {
                IsAssociatedToSheet: false,
            },
        },
    }).save();

    res.json({ status: 'successful' });
});

module.exports = router;
