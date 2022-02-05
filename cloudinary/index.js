const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//Set up Cloudinary using the credentials stored in the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

//Create a new Cloudinary storage, in which our images will be stored
const storage = new CloudinaryStorage({
    //Pass in our config object
    cloudinary,
    params: {
        //Folder in CLoudinary in which we store our files
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}