//Mongoose model
const Campground = require('./models/campground.js')
const Review = require('./models/review.js')

//Server side data validation coming from request
const { campgroundSchema, reviewSchema } = require('./schemas.js');

//Utilities to handle errors
const ExpressError = require('./utils/ExpressError.js')

//Define here multiple middleware functions

//Middleware used to verify that a user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    //isAuthenticated is a method added by passport to the request object
    if (!req.isAuthenticated()) {
        //Store into the session the path the user was trying to reach, so that once the login is done he is redirected there
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

//Middleware used to validate the data coming from the request to create a new campground
module.exports.validateCampground = (req, res, next) => {
    //Validate the data coming from the request's body against the schema before Mongoose is even involved
    const { error } = campgroundSchema.validate(req.body);
    //If there is an error it will be raised and captured by the error-handling middleware
    if (error) {
        //Make a single string message and print it
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//Server side authorization: middleware used to check if the user sending the request is equal to the author of the campground
module.exports.isAuthor = async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//Middleware used to validate the data coming from the request to create a new review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//Server side authorization: middleware used to check if the user sending the request is equal to the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}