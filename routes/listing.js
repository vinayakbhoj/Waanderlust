const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
// use for uploading images and files
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


// Index and create route using router.route function
router.route("/")
        .get(wrapAsync(listingController.index))
        .post( isLoggedIn, 
            upload.single('listing[image]'),
            validateListing,
            wrapAsync(listingController.createListing) 
);

// search listings
router.route("/search")
        .get(wrapAsync(listingController.search))
        .post(wrapAsync(listingController.search));
        
// new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// update, show and delete route
router.route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(isLoggedIn,isOwner,
        upload.single('listing[image]'),
        validateListing,
    wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,
    wrapAsync(listingController.deleteListing)
);


// edit route
router.get("/:id/edit",
     isLoggedIn,
     isOwner,
     wrapAsync(listingController.editListing));

module.exports = router;