const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uname: {type: String, unique: true},
    upass: {type: String},
    temp_login: {type: String},
    tfa: {
        secret: {type: String},
        tempSecret: {type: String},
        dataURL: {type: String},
        tfaURL: {type: String},
        counter: {type: Number}
    }

});

const User = mongoose.model('User', UserSchema);

module.exports = User;