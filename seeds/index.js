//File used to populate our database with seed data 
const mongoose = require('mongoose');
const cities = require('./cities.js');
const { places, descriptors } = require('./seedHelpers.js');

const Campground = require('../models/campground.js')

//Connect Mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

//Handle Mongoose connection errors
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

//Function to pick a random number from an array
const sample = array => array[Math.floor(Math.random() * array.length)];

//Function used to enter seed data to the DB 
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // Your user ID
            author: '61f40e93a8b698a4ec42f0f1',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Some description',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [{
                url: "https://res.cloudinary.com/dhrnbf7mx/image/upload/v1643984526/YelpCamp/campground_gdzcna.png",
                filename: "YelpCamp/enflfzf8rqv4xfayx2bn"
            }]
        })
        await camp.save();
    }
}

//Execute the async function, then automatically close the connection to Mongoose 
seedDB().then(() => {
    mongoose.connection.close();
})