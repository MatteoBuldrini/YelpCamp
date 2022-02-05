//Define here the main logic of the campgrounds routes, what actually happens when users go to these routes

//Mongoose model
const Campground = require('../models/campground.js');

//Used to delete images from Cloudinary
const { cloudinary } = require('../cloudinary/index.js');

//Require mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
//Use the Mapbox token included in the .env file
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

//Index page, view all campground
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}

//Render form to add a new campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

//Save new campground in Mongo (used in post request)
module.exports.createCampground = async (req, res) => {
    //Use Mapbox to get the coordinates from the location entered by the user
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, //Location entered in the form
        limit: 1 //Max number of results from the query
    }).send();
    //If no errors, the data is saved in Mongoose
    const campground = new Campground(req.body.campground);
    //Store the GeoJSON coming from Mapbox in our campground
    campground.geometry = geoData.body.features[0].geometry;
    //Create an array containing the path and the filename of the uploaded images
    //req.files comes from multer middleware
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    //Add to the campground item the user that created it. Useful for authorization
    campground.author = req.user._id; //req.user property is available thanks to Passport
    await campground.save();
    //Flash message that appears only after creating a campground when you are redirected to the page
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${campground._id}`);
}

//View individual campground details
module.exports.showCampground = async (req, res) => {
    //With .populate get the actual data referencing another model
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        //This populate is nested because we want to populate the author of each review
        populate: {
            path: 'author'
        }
    }).populate('author');
    //Flash message if not found
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { campground });
}

//Render form to edit a campground
module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    //Flash message if not found
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { campground });
}

//Update an existing campground (used in put request)
module.exports.updateCampground = async (req, res) => {
    const id = req.params.id;
    //Used the spread syntax to destructure the object
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    //Add new images to the array of images of each campground
    //req.files comes from multer middleware
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    //If any image was selected, remove from Cloudinary and MongoDB
    if (req.body.deleteImages) {
        //Remove selected images from Cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        //Remove selected images from MongoDB
        //Pull from the images array all images with filename is in the req.body.deleteImages array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await campground.save();
    //Flash message that appears only after updating a campground when you are redirected to the page
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

//Delete an existing campground (used in a delete request)
module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    //Flash message that appears only after deleting a campground when you are redirected to the page
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}