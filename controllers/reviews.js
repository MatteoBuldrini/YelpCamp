//Define here the main logic of the reviews routes, what actually happens when users go to these routes

//Mongoose model
const Campground = require('../models/campground.js')
const Review = require('../models/review.js')


//Create a new review (used in a post request)
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    //Add to the review item the user that created it. Useful for authorization
    review.author = req.user._id; //req.user property is available thanks to Passport
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    //Flash message that appears only after creating a review when you are redirected to the page
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

//Delete an existing review (used in a delete request)
module.exports.deleteReview = async (req, res) => {
    //Both the campground and the review IDs are needed
    const { id, reviewId } = req.params;
    //Remove the reference from the reviews array in the Campground model
    //$pull operator removes from an array all values that match a specified condition
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //Delete the review from the Review model
    await Review.findByIdAndDelete(req.params.reviewId);
    //Flash message that appears only after deleting a review when you are redirected to the page
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}