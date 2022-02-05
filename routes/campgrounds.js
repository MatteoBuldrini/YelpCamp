//Define here all the routes /campgrounds
const express = require('express');
const router = express.Router();

//Multer middleware, used to handle multipart/form-data forms, that send files (e.g. images)
const multer = require('multer');
//Import the Cloudinary storage previously defined
const { storage } = require('../cloudinary/index.js');
//Specify where we want to store the uploaded files, in this case to our Cloudinary storage
const upload = multer({ storage });

//Import controllers
const campgrounds = require('../controllers/campgrounds.js');

//Utilities to handle errors
const catchAsync = require('../utils/catchAsync.js')

//Mongoose model
const Campground = require('../models/campground.js')

//Import middleware functions
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js');


//Group multiple routes to the same path
router.route('/')
    //View all campgrounds
    .get(catchAsync(campgrounds.index))
    //Post request to create a new campground
    //upload.array is the middleware used to upload the images on Cloudinary
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

//Form to add a new campground and then post request
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    //View individual campground details
    .get(catchAsync(campgrounds.showCampground))
    //Put request to update an existing campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //Delete request to remove a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//Form to edit campground and then put request
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;