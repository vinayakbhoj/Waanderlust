const express = require("express");
// when router needs another router parameters 
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// Reviews route
// Post
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview));

// Delete post route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deleteReview));

// router.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute Goa",
//         country: "India"
//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesful testing");
    
// });

// 


module.exports = router;