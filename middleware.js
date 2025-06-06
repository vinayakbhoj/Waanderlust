const Listing = require("./models/listing");
const {listingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (! req.isAuthenticated()) {
        // after login rediret page
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing !");
        return res.redirect("/login");
    }
    next();
}

// for redirecting on same page 
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// for autherization of owner of listings
module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not owner of the listings");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    // console.log(error);
    
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// for authentication of author of review
module.exports.isReviewAuthor = async(req, res, next) => {
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not author of the listings");
        return res.redirect(`/listings/${id}`);
    }

    next();
};