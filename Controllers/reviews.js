const Review = require("../Models/review.js");
const Listing = require("../Models/listing.js");

module.exports.postReview = async (req,res)=>{

    let listing = await Listing.findById(req.params.id);
    
    let newReview = new Review(req.body.review); 
    newReview.author = req.user._id;
    //console.log(newReview.owner);
    listing.reviews.push(newReview);
 
    await newReview.save();
    await listing.save();                   //  Existing document mai kuch save karna hota hai toh , hum .save use karte hai jo khudmai ek Asynchronous function hai , issliye await likhna padta hai.
 
    //console.log("New Review Saved");
    //res.send("New Review Saved");
    req.flash("success" , "New Review Posted!");
    res.redirect(`/listings/${listing._id}`);
 }

 module.exports.destroyReview = async(req,res)=>{
    let {id , reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id , {$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("error","Review Deleted!");
    res.redirect(`/listings/${id}`);
}
/*
Mongo $pull operator : 
$pull    --> The $pull Operator removes from an existing array all instances of a value or values that match a specified condition 
*/