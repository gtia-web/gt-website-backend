const mongoose = require('mongoose');

const HashedPasswordSchema = mongoose.Schema({
    HashedPassword: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model('HashedPasswords', HashedPasswordSchema);