const mongoose = require('mongoose');
const connection = require('./../config/dbconn');

//// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String
});

//// Defines the model that we will use in the app
const User = connection.model('User', UserSchema);


module.exports = User;