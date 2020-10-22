const UserProfile = require('../models/UserProfile');

const authMiddleware = {};
/**
 * Checks if the user is logged in.
 * If user if found, add the current user to request header and continue with request
 * If not found, respond with an error message
 */
authMiddleware.isLoggedIn = async (req, res, next) => {
    try {
        const currentUser = await UserProfile.findById(req.body.currentuserid);
        if (user) {
            req.currentUser = currentUser;
            return next();
        }

        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: "User not logged in",
            exist: false
        });

    } catch (err) {
        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: err,
            exist: false
        });
    }
}

/**
 * Checks if the current user is a VP and continue the request
 * Note req must contain currentUser which can be done by calling `isLoggedIn` middleware before this
 */
authMiddleware.isVP = async (req, res, next) => {
    try {
        if (req.currentUser.VPStatus.isVP) {
            return next();
        }

        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: "Current User does not have permission to use operation"
        });

    } catch (err) {
        return res.json({
            runtimeErrorOccurred: true,
            errorMessage: err
        });
    }
}

module.exports = authMiddleware;