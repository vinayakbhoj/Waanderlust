if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

// console.log(process.env.SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
// ejs mate
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
// connect-mongo storage of mongo for sessions,etc
const MongoStore = require('connect-mongo');
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const flash = require("connect-flash");
// authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
// method override
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));

const dbUrl = process.env.ATLASDB_URL;

main() 
.then(() => {
    console.log("connected to db");
    
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// mongostore mongo-connect
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("error in mongo session", err);
    
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.get("/", (req, res) => {
     res.redirect("/listings");
});



// session
app.use(session(sessionOptions));
// flash msg
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// fake user demo
// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "demo1@gmail.com",
//         username: "demo1"
//     });

//     let registerdUser = await User.register(fakeUser, "demo123");
//     res.send(registerdUser);
// });


// Listings Routes
app.use("/listings", listingsRouter);
// Reviews Routes 
app.use("/listings/:id/reviews", reviewsRouter);
// User Routes
app.use("/", userRouter);
//  Search routes
// app.use("/listings/search", )


app.use((err, req, res, next) => {
    let {statusCode=500, message="Something wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
    
});

// app.listen(8080, () => {
//     console.log("port 8080");
// })

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
