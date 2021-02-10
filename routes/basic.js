const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

const authentication = require("../utility/authentication");

router.get('/', authentication.checkAuthenticated, async (req, res) => {
    res.redirect('/home');
})

router.get('/home', authentication.checkAuthenticated, async (req, res)=> {
    userData = await UserProfile.findById(req.user._id)
    res.render('home.ejs', {user: userData})
})

router.get('/dashboardT',async (req, res) => {
    res.render('dashboard_template.ejs')
})


module.exports = router;