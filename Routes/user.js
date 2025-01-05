const express = require("express");
const router = express.Router();
const User = require("../Models/user.js");
const wrapAsync = require("../Utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../Utils/middleware.js");
const { renderSignUpForm, signUp, renderLoginForm, logIn, logOut } = require("../Controllers/user.js");

// SignUp Form pr jana & SignUp karna 
router.route("/signup")
      .get(renderSignUpForm)
      .post(signUp);


router.route("/login")          
      .get( renderLoginForm)
      .post(                  // jaise hi hum /login karenge , jaise hi passport.authenticate ho jayega , & iss upar wale middleware se success message aa jayega , jaise hi hum login karte hai ,, waise hi passport bydefault req.session ko reset kr deta hai , jisse agar iss middleware ne koi exrta info store karayi hogi req.session mai toh vo delete ho jayegii. Isliye ye redirectUrl ki value hum locals mai store karenge , kyuki passport ke pass locals ko delete krne ka access nahi hota .................. Toh issliye hume passport user ko authenticate kare usse pehle hame uska jo redirectUrl hai , usko locals ke andar save karana padega ,,, toh upar wale middleware mai passport. authenticate se pehle we will call saveRedirectUrl.
        saveRedirectUrl,    // ye pehle redirectUrl save karayega req.session se nikalke 
        passport.authenticate("local", {   // fir passport se login karenge 
        failureRedirect: "/login",     // fir req.session se redirectUrl remove ho jayega pr usee humne locals mai store  kr rkha hai
        failureFlash: true,
        
        }),
        logIn
);

// logout 
router.get("/logout", logOut);

module.exports = router;

