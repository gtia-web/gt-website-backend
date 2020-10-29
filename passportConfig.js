const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy;
const UserProfile = require('./models/UserProfile');


module.exports = function(passport) {
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            user = await UserProfile.findOne({
                Username: username
            });

            if (user != null){
                bcrypt.compare(password, user.HashedPassword, (err, res) => {
                    if (res == true) {
                        return done(null, user)
                    } else {
                        return done(null, false)
                    }
                })
            } else {
                return done(null, false)
            }
            
        })
    );

    passport.serializeUser((user, cb) => {
        cb(null, user._id)
    });

    passport.deserializeUser(async (id, cb) => {
        user = await UserProfile.findById(id)
        cb(null, user)
    });

}
