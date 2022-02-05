//Authentication routes
const express = require('express');
const router = express.Router();
const passport = require('passport');

//Utilities to handle errors
const catchAsync = require('../utils/catchAsync.js')

//Mongoose models
const User = require('../models/user');

//Import controllers
const users = require('../controllers/users.js');


router.route('/register')
    //Display form to register a new user
    .get(users.renderRegister)
    //Post request to register a new user
    .post(catchAsync(users.register));

router.route('/login')
    //Display form to login a user
    .get(users.renderLogin)
    //Post request to login a user
    //The passport.authenticate middleware handles behind the scenes the process of hashing the entered password and comparing it to the one stored, authentication errors, etc
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//Logout the user
router.get('/logout', users.logout);

module.exports = router;