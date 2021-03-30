const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

const authentication = require("../utility/authentication");
const gcManager = require("../utility/GoogleCloudManager");

/** 
 * Redirect to Home Page
 */
router.get('/', authentication.checkAuthenticated, async (req, res) => {
    res.redirect('/home');
})

/**
 * Get Home Page if Logged in
 */
router.get('/home', authentication.checkAuthenticated, async (req, res)=> {
    userData = await UserProfile.findById(req.user._id)
    res.render('home.ejs', {user: userData})
})

/**
 * Get Admin Portal Page
 */
router.get('/admin', authentication.checkAuthenticated, 
    authentication.checkAuthenticatedAdmin, async (req, res) => {
    userData = await UserProfile.findById(req.user._id)
    res.render('admin_portal.ejs',  {user: userData})
})

router.get('/googleAPI', async (req, res) => {
    
    res.render('googleAPI.ejs', {
        SpreadSheetURL: (await gcManager.createNewGCSheet('Test Title 5', true)).data.spreadsheetUrl
    })
})

module.exports = router;