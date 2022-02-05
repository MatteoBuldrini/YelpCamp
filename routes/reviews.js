//Define here all the routes /campgrounds/:id/reviews
const express = require('express');
const router = express.Router({ mergeParams: true }); //mergeParams is needed in order to have access to the id of each review from req.params.id, because the path containing the :id is defined in another file (app.js)

//Utilities to handle errors
const catchAsync = require('../utils/catchAsync.js')
const ExpressError = require('../utils/ExpressError.js');

//Mongoose model
const Campground = require('../models/campground.js')
const Review = require('../models/review.js')

//Import controllers
const reviews = require('../controllers/reviews.js');

//Import middleware functions
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');


//Post request to create a new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//Delete request to remove an existing review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;