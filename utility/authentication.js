const UserProfile = require('../models/UserProfile');

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/user/login')
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

async function checkAuthenticatedAdmin (req, res, next) {
    let userData = await UserProfile.findById(req.user._id)
    if (userData.SpecialPermissions.includes('admin')) {
        return next();
    } else {
        return res.redirect('/')
    }
}

module.exports = {
  checkNotAuthenticated, 
  checkAuthenticated,
  checkAuthenticatedAdmin
};