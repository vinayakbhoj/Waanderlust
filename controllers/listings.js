const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// index route
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    // console.log(allListings);
    
    res.render("listings/index.ejs", { allListings });
};

// search route
module.exports.search = async (req, res) => {
    
    let country = req.body.country;
    console.log(country);
    try {
        const allListings = await Listing.find({country:country});
    console.log(allListings[0].country);
    
    // res.send("match");
    if (allListings[0].country == country) {
        res.render("listings/search.ejs", { allListings });
    }else {
        req.flash("error", "Listing Not Exist!!!");
         res.redirect("/listings");
    }
    } catch (error) {
        req.flash("error", "Listing Not Exist!!!");
         res.redirect("/listings");
    }
    
    
};

// new route
module.exports.renderNewForm = (req, res) => {
    
    res.render("listings/new.ejs")
};

// show route
module.exports.showListings = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing Not Exist!!!");
        res.redirect("/listings");
    }
    // console.log(listing);
    
    res.render("listings/show.ejs", { listing })
};

// create route
module.exports.createListing = async (req, res, next) => {
    
   let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    // location mapbox
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    // console.log(savedListing);
    
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
    
};

// edit route
module.exports.editListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Exist!!!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_200");

    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

// update route
module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    

    req.flash("success", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
};

// delete route
module.exports.deleteListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!!!");

    res.redirect("/listings");
    
};