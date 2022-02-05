const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

//Define user schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//The following line I) adds to the user schema username and password fields, II) checks that usernames are unique, III) adds additional methods to the schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);