const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const User = require('./models/user');
const connection = require('./config/dbconn');


//General setup 

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

//Create the express application
const app = express();

// Middleware that allows Express to parse through both JSON and x-www-form-urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//PASSPORT
require('./config/passport')(passport);

//Database
//Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 //* string into the `.env` file:
 //DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
//  const conn = process.env.DB_STRING
//  const connection = mongoose.createConnection( conn, {
//      useNewUrlParser: true,
//      useUnifiedTopology: true
//  });

 //// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
//  const UserSchema = new mongoose.Schema({
//      username: String,
//      hash: String,
//      salt: String
//  });

 //// Defines the model that we will use in the app
//  const User = connection.model('User', UserSchema);


 /**
 * This function is called when the `passport.authenticate()` method is called.
 * 
 * If a user is found an validated, a callback is called (`cb(null, user)`) with the user
 * object.  The user object is then serialized with `passport.serializeUser()` and added to the 
 * `req.session.passport` object. 
 */


//  passport.use( new LocalStrategy(
//     function( username, password, cb ) {
//         User.findOne({ username: username})
//         .then((user) => {
//             if(!user) { return cb( null, false) }

//             //function defined at bottom of app.js
//             const isValid = validPassword( password, user.hash, user.salt);

//             if(isValid) { return cb( null, user ); 
//             }else{
//                 return cb( null, false );
//             }
//         })
//         .catch((err) => {
//             cb(err);
//         });
//     }
// ));

/**
 * This function is used in conjunction with the `passport.authenticate()` method.  See comments in
 * `passport.use()` above ^^ for explanation
 */

passport.serializeUser( function( user, cb ) {
    cb( null, user.id);
});

/**
 * This function is used in conjunction with the `app.use(passport.session())` middleware defined below.
 * Scroll down and read the comments in the PASSPORT AUTHENTICATION section to learn how this works.
 * 
 * In summary, this method is "set" on the passport object and is passed the user ID stored in the `req.session.passport`
 * object later on.
 */

passport.deserializeUser( function( id, cb ) {
    User.findById( id, function( err, user ) {
        if(err) { return cb( err); }
        cb( null, user );
    });
});


//SESSION SETUP
 //The MongoStore is used to store session data.  We will learn more about this in the post.
 //* Note that the `connection` used for the MongoStore is the same connection that we are using above
 const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions'});

 //See the documentation for all possible options - https://www.npmjs.com/package/express-session
 //* As a brief overview (we will add more later): 
 //* secret: This is a random string that will be used to "authenticate" the session.  In a production environment,
 //* you would want to set this to a long, randomly generated string
 //* resave: when set to true, this will force the session to save even if nothing changed.  If you don't set this, 
 //* the app will still run but you will get a warning in the terminal 
 //* saveUninitialized: Similar to resave, when set true, this forces the session to be saved even if it is unitialized
 app.use(session({
     secret: process.env.SECRET,
     resave: false,
     saveUninitialized: true,
     store: sessionStore,
     cookie: {
         maxAge: 1000 * 60
     }
 }));


 //START PASSPORT AUTHENTICATION 
 /**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */
/**
 * Notice that these middlewares are initialized after the `express-session` middleware.  This is because
 * Passport relies on the `express-session` middleware and must have access to the `req.session` object.
 * 
 * passport.initialize() - This creates middleware that runs before every HTTP request.  It works in two steps: 
 *      1. Checks to see if the current session has a `req.session.passport` object on it.  This object will be
 *          
 *          { user: '<Mongo DB user ID>' }
 * 
 *      2.  If it finds a session with a `req.session.passport` property, it grabs the User ID and saves it to an 
 *          internal Passport method for later.
 *  
 * passport.session() - This calls the Passport Authenticator using the "Session Strategy".  Here are the basic
 * steps that this method takes:
 *      1.  Takes the MongoDB user ID obtained from the `passport.initialize()` method (run directly before) and passes
 *          it to the `passport.deserializeUser()` function (defined above in this module).  The `passport.deserializeUser()`
 *          function will look up the User by the given ID in the database and return it.
 *      2.  If the `passport.deserializeUser()` returns a user object, this user object is assigned to the `req.user` property
 *          and can be accessed within the route.  If no user is returned, nothing happens and `next()` is called.
 */


app.use(passport.initialize());
app.use(passport.session());

//End of passport configuration





 //ROUTES
 // When you visit http://localhost:3000/login, you will see "Login Page"
// app.get('/', (req, res ) => {
//     res.send('<h1>Home</h1>');
//     console.log(process.env.DB_STRING);
// });

app.use('/', require('./routes/index'));
app.use('/login', require('./routes/index'));
app.use('/register', require('./routes/index'));
app.use('/protected-route', require('./routes/index'));
app.use('/logout', require('./routes/index'));
app.use('/login-success', require('./routes/index'));
app.use('/login-failure', require('./routes/index'));


//  app.get('/login', (req, res, next) => {
//     const form = '<h1>Login Page</h1><form method="POST" action="/login">\
//     Enter Username:<br><input type="text" name="username">\
//     <br>Enter Password:<br><input type="password" name="password">\
//     <br><br><input type="submit" value="Submit"></form>';
//     res.send(form);
//  });

//  app.post('/login', passport.authenticate('local', 
//  { failureRedirect: '/login-failure', successRedirect: '/login-success'}) ,( err, req, res, next) => {
//     if(err) { next(err) }
//     console.log(req.body);
//  });

 // When you visit http://localhost:3000/register, you will see "Register Page"
//  app.get('/register', (req, res, next) => {
//     const form = '<h1>Register Page</h1><form method="post" action="register">\
//     Enter Username:<br><input type="text" name="username">\
//     <br>Enter Password:<br><input type="password" name="password">\
//     <br><br><input type="submit" value="Submit"></form>';
// res.send(form);
//  });

//  app.post('/register', (req, res, next) => {
//     const saltHash = genPassword(req.body.password);
    
//     const salt = saltHash.salt;
//     const hash = saltHash.hash;
//     const newUser = new User({
//         username: req.body.username,
//         hash: hash,
//         salt: salt
//     });
//     newUser.save()
//         .then((user) => {
//             console.log(user);
//         });
//     res.redirect('/login');
//  });


 /**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 * 
 * Also, look up what behaviour express session has without a maxage set
 */


//  app.get('/protected-route', (req, res, next) => {
//     console.log(req.session);
//     if (req.isAuthenticated()) {
//         res.send(`<h1>You are authenticated</h1> `);
//     } else {
//         res.send('<h1>You are not authenticated</h1>');
//     }
// });
// Visiting this route logs the user out
// app.get('/logout', (req, res, next) => {
//     req.logout();
//     res.redirect('/login');
// });
// app.get('/login-success', (req, res, next) => {
//     console.log(req.session);
//     res.send('You successfully logged in.');
// });
// app.get('/login-failure', (req, res, next) => {
//     res.send('You entered the wrong password.');
// });



 //Server
 app.listen(3000, () => console.log('Server running...') );



 //HELPER FUNCTIONS
/**
 * 
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 * 
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */

//  function validPassword( password, hash, salt ) {
//     const hashVerify = crypto.pbkdf2Sync( password, salt, 1000, 64, 'sha512').toString('hex');
//     return hash === hashVerify;
//  }



/**
 * 
 * @param {*} password - The password string that the user inputs to the password field in the register form
 * 
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 * 
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */

//  function genPassword(password) {
//      const salt = crypto.randomBytes(32).toString('hex');
//      const genHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
//      return {
//          salt: salt,
//          hash: genHash
//      };
//  }