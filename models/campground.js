//Define Mongoose model
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
});
//Create virtual property: add to all URLs a width parameter, which is used from Cloudinary to change the sizes of images
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})


//By default, Mongoose does not include virtuals when you convert a document to JSON in order to read it on the client-side Javascript. This is used to include the properties.popUpMarkup virtual
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    //GeoJSON data coming from Mapbox, it has a the key type which must be equal to Point and an array with the coordinates
    geometry: {
        type: {
            type: String,
            enum: ['Point'], //The value has to be the one specified (aka Point)
            required: true
        },
        coordinates: {
            type: [Number], //Array of numbers
            required: true
        }
    },
    //Reference to the user model
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // An array that references the review model
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

//Create virtual property that is used to match the pattern required by Mapbox in order to read the GeoJSON data, i.e. adding the campground properties inside the key "properties". This is used to add Popups to the map when you click
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});


//Delete from MongoDB all the reviews associated with a campground that was deleted
CampgroundSchema.post('findOneAndDelete', async function (deletedDoc) {
    //If a document was actually deleted
    if (deletedDoc) {
        //Delete all reviews where their id is in the document that was deleted
        await Review.deleteMany({ _id: { $in: deletedDoc.reviews } })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);