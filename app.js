//If we are not running the app in production, require the package which is used to read the .env file containing Cloudinary credentials
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');

//Packages used to improve security
//Prevent MongoDB injection
const mongoSanitize = require('express-mongo-sanitize');
//Manipulate HTTP headers
const helmet = require('helmet');

//Import passport packages
const passport = require('passport');
const LocalStrategy = require('passport-local');

const session = require('express-session');
//Used to store the session in Mongo
const MongoStore = require('connect-mongo');


//Utilities to handle errors
const ExpressError = require('./utils/ExpressError.js');

//Require routes
const userRoutes = require('./routes/users.js')
const campgroundRoutes = require('./routes/campgrounds.js')
const reviewRoutes = require('./routes/reviews.js')

//Require models
const User = require('./models/user.js');

//MongoDB Atlas URL or the local host
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//'mongodb://localhost:27017/yelp-camp'

//Connect Mongoose
mongoose.connect(dbUrl, {
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

//Set up Express application
const app = express();
//Specify to Express that we use EJS mate
app.engine('ejs', ejsMate);
//Specify to Express that we use EJS
app.set('view engine', 'ejs');
//Specify the directory that contains our views
app.set('views', path.join(__dirname, 'views'));
//Tell Express to parse post requests coming from forms
app.use(express.urlencoded({ extended: true }));
//Used to fake post requests sent from a form into patch/put/delete requests
app.use(methodOverride('_method'));
//Specify the directory containing static files such as images, CSS files, and JavaScript files
app.use(express.static(path.join(__dirname, 'public')));
//Prevent MongoDB injection
app.use(mongoSanitize());

//Helmet stuff, used to allow only specific locations from which we are fetching resources (e.g. scripts from Mapbox)
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            //self stands for the same source as the app
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhrnbf7mx/", //My specific Cloudinary account
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Heroku environment variable
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

//Store session in Mongo
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    //Avoid resaving all the session on database every single time the user refersh the page
    touchAfter: 24 * 60 * 60 //Time in seconds
});
store.on("error", function (e) {
    console.log("Session store error", e)
});

//Session configuration
const sessionConfig = {
    //Pass our Mongo store
    store: store,
    //Cookie name
    name: 'session',
    secret: secret,
    //The following two to remove deprecation warnings
    resave: false,
    saveUninitialized: true,
    //Cookies configuration
    cookie: {
        //Cookies cannot be accessed through client-side JavaScript, improves security
        httpOnly: true,
        //Cookies can only work only on https (in development, localhost is not going to work)
        // secure: true,
        //Expires after a week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

//Set up flash
app.use(flash());

//Passport configuration
app.use(passport.initialize());
//Add persistent login sessions (so you don't have to login every time you send a request). It must go after app.use(session());
app.use(passport.session());
//Tell passport to use the local strategy to authenticate users
passport.use(new LocalStrategy(User.authenticate()));
//Function used by Passport to serialize (store) users into the session
passport.serializeUser(User.serializeUser());
//Function used by Passport to deserialize (remove) users from the session
passport.deserializeUser(User.deserializeUser());


//Middleware used to store I) whatever is in the flash (if there's something) and II) the information about the user into res.locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user; //req.user property is provided by Passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//Handle routes
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home.ejs');
})


//Matches all type of requests, in case no pattern is matched first
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

//Error-handling middleware
app.use((err, req, res, next) => {
    //Get status code if exists because it is an error we throw. If not, set default value of 500
    const { statusCode = 500 } = err;
    //Set default error message if it does not exist
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error.ejs', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})