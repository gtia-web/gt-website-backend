const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const GlobalVariables = require('../models/GlobalVariables');
const authentication = require("../utility/authentication");
const gcManager = require("../utility/GoogleCloudManager");

/** 
 * Redirect to Home Page
 */
router.get('/', (req, res) => {
    res.render('sun/index.ejs');
});

router.get('/faq', (req, res) => {
    res.render('sun/faq.ejs');
});

/**
 * Get Home Page if Logged in
 */
router.get('/home', authentication.checkAuthenticated, async (req, res)=> {
    let userData = await UserProfile.findById(req.user._id)
    let globalVariables = await GlobalVariables.findById(process.env.GLOBAL_VARIABLES_ID)
    res.render('home.ejs', {
        user: userData,
        globalVariables: globalVariables
    })
})

/**
 * Get Admin Portal Page
 */
router.get('/admin', authentication.checkAuthenticated,
    authentication.checkAuthenticatedAdmin, async (req, res) => {
        let userData = await UserProfile.findById(req.user._id)
        res.render('admin_portal.ejs',  {user: userData})
})

module.exports = router;