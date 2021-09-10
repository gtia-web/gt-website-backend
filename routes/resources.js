const express = require('express');
const router = express.Router();

/** 
 * Get career resources page
 */
router.get('/career', (req, res) => {
    res.render('sun/career-resources.ejs')
});

module.exports = router;