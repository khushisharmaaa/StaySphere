const Listing = require("../Models/listing");
const Review = require("../Models/review");
const { listingSchema , reviewSchema } = require("../Schema.js");
const ExpressError = require("./ExpressError.js");





// This middleware is for Authentication ,, check karega whether the user is logged in or not 
module.exports.isLoggedIn = (req,res,next)=>{
    
    if(!req.isAuthenticated()){  // this isAuthenticated() check whether the user is logged in or not , returns true if loggedin and false if not loggedOut

        req.session.redirectUrl = req.originalUrl;   // ye req.originalUrl vo URL dega jispe hame jana tha ,, ye hum req.session mai redirectUrl variable banake usme store kar rahe hai by this line ,, taki fir kisi bhi middleware mai hum usee(redirectUrl ko) use kar sake ,, kyuki har middleware ke pass session ka access toh hota hi haii by using req.session. -------------  Ye chij hum kar rahe hai taki , manlo user loggedin nahi hai , he clicks on Add new listing , login page khul jaega , user ke login karne pr hum sidha add new listing page pr challe jaye , naa ki all listings pr ,,, issliye hum originalUrl store krkr rkh rahe , iss originalUrl mai addnewListing ka path hoga (mtlb jaha jate hue roka gaya tha login krne ke liye ) 
        req.flash("error" , "You must be logged in !");
        return res.redirect("/login");
    } 
    next();

}


// jb koi kaam login krne ke liye ruke , tab after login hum usi jagah pohoch jaaye jaha chhoda tha 
module.exports.saveRedirectUrl = (req,res,next) =>{
if(req.session.redirectUrl){ // agar req ke session ke andar koi redirectUrl save hua hai , toh use local variable mai store kardo. 
    res.locals.redirectUrl=req.session.redirectUrl;
} 
next();
}
// Passport ke pass access nahi hota locals ko delete krne ka
// jaise hi hum /login karenge , jaise hi passport.authenticate ho jayega , & iss upar wale middleware se success message aa jayega , jaise hi hum login karte hai ,, waise hi passport bydefault req.session ko reset kr deta hai , jisse agar iss middleware ne koi exrta info store karayi hogi req.session mai toh vo delete ho jayegii. Isliye ye redirectUrl ki value hum locals mai store karenge , kyuki passport ke pass locals ko delete krne ka access nahi hota 



// Checks whether the user trying to make changes is Owner of listing or not 
module.exports.isOwner = async (req,res,next) =>{         // Ye function check  karega , ki jo user listing mai changes karen ki try kar raha hai , kya vo owner hai kya , kya uske paas authority hai vo change krne ki 
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if(!(req.user && listing.owner._id.equals(req.user._id))) {  // Check kar rahe ki jo user listing ko edit krne ka try kar raha hai , kya vo iss listing ka Owner hai ya nahi  
        req.flash("error" , "You are not the Owner of this Listing");
        return  res.redirect(`/listings/${id}`);
    }
    next();
};




// For Server Side Validation of Listings
module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error) {
       
        let errMsg = error.details.map((el) => el.message).join(",");  // For additional Details  , agar error ke sath aut bhi details aa rhi hai , sb comma se seperate hoke print ho jayegi iss Line -> error.details.map((el) => el.message).join(",");  se.  
        throw new ExpressError(400 , error);
    }else{
        next();
    }
};




// Server side validation of reviews 
module.exports.validateReview = (req,res,next)=>{  // ---> dekhega ki kya review ki sari chije reviewSchema ke hisab se sahi hai ya nahi ---> Iska ek middleware hi bana dete hai & middleware.js mai daal dete hai  ---> usme daalne ke baad we dont need to require reviewSchemma & ExpressError in this file 

    let {error} = reviewSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map((el)=> el.message).join(","); 
        throw new ExpressError(400,errMsg);
    }else{
    next();
    }
    
};


// Check karega ki jo user review ko delete kar raha hai , kya wahi uss Review ka author hai 
module.exports.isReviewAuthor = async (req,res,next) =>{

let {id,reviewId} = req.params;

let review = await Review.findById(reviewId);
if( !(req.user && review.author.equals(req.user._id)) ) {
req.flash("error" , "You are not the author of this Review");
return res.redirect(`/listings/${id}`);
}
next();
};