//Define here the main logic of the users routes, what actually happens when users go to these routes

//Mongoose models
const User = require('../models/user');


//Render form to register a new user
module.exports.renderRegister = (req, res) => {
    res.render('users/register.ejs')
}

//Register a new user (used in a post request)
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        //The method register adds to the user instance the given password, hashes it (using Pbldf2 algorithm), checks if the username is unique
        const registeredUser = await User.register(user, password);
        //Add automatic login after registration
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        //To handle errors (mostly in case a user is already registered)
        res.flash('error', e.message);
        res.redirect('register')
    }
}

//Render form to login a user
module.exports.renderLogin = (req, res) => {
    res.render('users/login.ejs')
}

//Handles flash and redirect when a user logins (used in a post reqyest)
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    //req.session.returnTo is created only when a user goes to a protected location for which logging in is required, but the user is not logged in
    //If req.session.returnTo exists take it, otherwise take /campgrounds
    const redirectUrl = req.session.returnTo || '/campgrounds';
    //Delete the property from the session
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

//Logout the user
module.exports.logout = (req, res) => {
    //Method added to req object by passport
    req.logout();
    req.flash('success', 'Logged out!');
    res.redirect('/campgrounds');
}