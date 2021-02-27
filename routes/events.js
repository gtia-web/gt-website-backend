const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');


const authentication = require("../utility/authentication");

/** 
 * Get events page
 */
router.get('/', authentication.checkAuthenticated, async (req, res) => {
    userData = await UserProfile.findById(req.user._id)
    res.render('events.ejs',  {user: userData})
})

module.exports = router;