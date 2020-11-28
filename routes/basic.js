const express = require('express');
const router = express.Router();

const authentication = require("../utility/authentication");

router.get('/', authentication.checkAuthenticated, (req, res) => {
    res.render('index.ejs')
})


module.exports = router;