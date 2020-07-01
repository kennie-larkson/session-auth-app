const crypto = require('crypto');



module.exports = {

    validPassword: function( password, hash, salt ) {
        const hashVerify = crypto.pbkdf2Sync( password, salt, 1000, 64, 'sha512').toString('hex');
        return hash === hashVerify;
     },

     genPassword: function(password) {
        const salt = crypto.randomBytes(32).toString('hex');
        const genHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return {
            salt: salt,
            hash: genHash
        };
    }
}





 