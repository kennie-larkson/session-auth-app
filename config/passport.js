const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {validPassword} = require('./utils');
const User = require('./../models/user');



module.exports = function passport(passport) {

    passport.use( new LocalStrategy(
        function( username, password, cb ) {
            User.findOne({ username: username})
            .then((user) => {
                if(!user) { return cb( null, false) }
    
                //function defined at bottom of app.js
                const isValid = validPassword( password, user.hash, user.salt);
    
                if(isValid) { return cb( null, user ); 
                }else{
                    return cb( null, false );
                }
            })
            .catch((err) => {
                cb(err);
            });
        }
    ));
}




// module.exports = passport;