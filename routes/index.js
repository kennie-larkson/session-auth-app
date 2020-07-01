const express = require('express');
const router = require('express').Router();
const User = require('./../models/user');
const connection = require('./../config/dbconn');
const {genPassword} = require('./../config/utils');
const passport = require('passport');



router.get('/', (req, res) => {
    res.send(`<h1>Home</h1>`);
});


router.get('/login', (req, res, next) => {
    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';
    res.send(form);
 });


 router.post('/login', passport.authenticate('local', 
 { failureRedirect: '/login-failure', successRedirect: '/login-success'}) ,( err, req, res, next) => {
    if(err) { next(err) }
    console.log(req.body);
 });


 router.get('/register', (req, res, next) => {
    const form = '<h1>Register Page</h1><form method="post" action="register">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';
res.send(form);
 });


 router.post('/register', (req, res, next) => {

    const saltHash = genPassword(req.body.password);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt
    });
    newUser.save()
        .then((user) => {
            console.log(user);
        });
    res.redirect('/login');
 });


 router.get('/protected-route', (req, res, next) => {
    console.log(req.session);
    if (req.isAuthenticated()) {
        res.send(`<h1>You are authenticated</h1> `);
    } else {
        res.send('<h1>You are not authenticated</h1>');
    }
});


 // Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/login');
});
router.get('/login-success', (req, res, next) => {
    console.log(req.session);
    res.send('You successfully logged in.');
});
router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});



module.exports = router;