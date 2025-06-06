const express = require("express");
// when router needs another router parameters 
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/users");

// signup routes get and post
router.route("/signup")
    .get(userController.renderSignForm)
    .post(wrapAsync(userController.signup)
);

// login routes get and post
router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, 
    passport.authenticate('local', {
        failureRedirect: '/login', 
        failureFlash: true
    }), 
    userController.login
);

router.get("/logout", userController.logout);

module.exports = router;