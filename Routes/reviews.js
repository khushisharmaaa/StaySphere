const express = require("express");
const router = express.Router( {mergeParams:true});   // ---> Ye mergeParams:true issliye likha hai taki app.js mai jo parent path hai /listings/:id/reviews uske paramteres (mtlb yaha id) yaha reviews.js file mai bhi aa jaye & yaha hum uss id ko access kar paye 
const wrapAsync = require("../Utils/wrapAsync.js");
const { listingSchema , reviewSchema } = require("../Schema.js");
const ExpressError = require("../Utils/ExpressError.js");
const Review = require("../Models/review.js");
const Listing = require("../Models/listing.js"); 
const {isLoggedIn, validateReview, isReviewAuthor} = require("../Utils/middleware.js");
const { postReview, destroyReview } = require("../Controllers/reviews.js");





/*
// For Server Side Validation of Reviews
const validateReview = (req,res,next)=>{   ------->  dekhega ki kya review ki sari chije reviewSchema ke hisab se sahi hai ya nahi ---> Iska ek middleware hi bana dete hai & middleware.js mai daal dete hai  ---> usme daalne ke baad we dont need to require reviewSchemma & ExpressError in this file 

    let {error} = reviewSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map((el)=> el.message).join(","); 
        throw new ExpressError(400,errMsg);
    }else{
    next();
    }
    };
*/

//Reviews  -- POST Route           -------                     // ab yaha pe hum bs /reviews ko bhi request bhej sakte the , pr usse ye nhi pata chalta ki koi review kis listing ke liye hai ,, issliye humne id bhi pass kari hai , taki pata rahe konsa review kis listing ka hai.
router.post("/", isLoggedIn ,validateReview, postReview);

// Delete Review Ruoute 
router.delete("/:reviewId" , isLoggedIn , isReviewAuthor ,  wrapAsync (destroyReview));
/*
Mongo $pull operator : 
$pull    --> The $pull Operator removes from an existing array all instances of a value or values that match a specified condition 
 
*/
    
 module.exports = router;