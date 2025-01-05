const express = require("express");
const router = express.Router();
const wrapAsync = require("../Utils/wrapAsync.js");
// const { listingSchema , reviewSchema } = require("../Schema.js");  middleware.js mai daal diya 
// const ExpressError = require("../Utils/ExpressError.js");  middleware.js mai daal diya 
//const Listing = require("../Models/listing.js");  // ../Models/listing.js means Models folder ke andar jao & listing.js ko le aao 
const {isLoggedIn, isOwner, validateListing} = require("../Utils/middleware.js");
const {index, renderNewForm, showListing, createListing, renderEditForm, editListing,destroyListing} = require("../Controllers/listings.js");

const multer = require("multer");  // Hum new form ka data multipart form mai bhej rahe hai jo backend ko toh samaj nahi aayega   ,, toh usee parse karne ke liye taki backend ko samaj aaye , we will use a new functionility / Package named 'multer' , ye multer package form ke data se files ko nikalega & automatically unn files ko ek 'uploads' naam  ka folder banake usme store kar dega.
const {storage} = require("../cloudConfig.js");


 //const upload = multer({dest:'uploads/'}); // Isme hame batana padta hai ki , form se jo bhi files aayengi vo hum kaha pe save karwana chahte hai ,,,, hum toh cloudinary mai karenge isliye yaha 'Storage' likha hai jo cloudinary ka storage hai ,, following line likhenge iss line ki jagah , kyuki ye to bs demo ke liye thi 
const upload = multer({storage});

/*
// For Server Side Validation of Listings-->  dekhega ki kya listing ki sari chije ListingSchema ke hisab se sahi hai ya nahi ---> ye har jagah listing ke functions mai kaam aayega ---> Iska ek middleware hi bana dete hai & middleware.js mai daal dete hai  ---> usme daalne ke baad we dont need to require listingSchemma & ExpressError in this file 
const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error) {
       
        let errMsg = error.details.map((el) => el.message).join(",");  // For additional Details  , agar error ke sath aut bhi details aa rhi hai , sb comma se seperate hoke print ho jayegi iss Line -> error.details.map((el) => el.message).join(",");  se.  
        throw new ExpressError(400 , error);
    }else{
        next();
    }
}
*/

// Index & Create Route 
router.route("/")
      .get( wrapAsync (index))
      .post( isLoggedIn , /*validateListing */ upload.single("listing[image]") ,wrapAsync(createListing));  // ye upload.single("listing[image]") req.file ke andar file ka data/link le aayega 
     
      


     //   .post(upload.single("listing[image]") /* iska mtlb hai ki  listing[image] se jo single image aa rhi hai ,vo uploads folder mai upload ho jaye   */  , (req,res)=>{
    //     res.send(req.file);
    //   });   // Hum new form ka data multipart-form-data mai bhej rahe hai jo backend ko toh samaj nahi aayega   ,, toh usee parse karne ke liye we will use a new functionility / Package named 'multer'



// New Route
router.get("/new" , isLoggedIn , renderNewForm);   //  iss /new wale route ko hum /:id ke pehle hi likhenge , kyuki fir /new ko id samjega code/server jisse error aa jayega 

// Show Route & Delete Route 
router.route("/:id")
      .get(wrapAsync(showListing))
      .delete(isLoggedIn ,isOwner, wrapAsync(destroyListing));

// Update Routes --> Ek for edit form & 2nd for completing Edit. 
router.route("/:id/edit")
      .get(isLoggedIn ,isOwner, wrapAsync(renderEditForm))
      .patch(isLoggedIn ,isOwner, /*validateListing ,*/ upload.single("listing[image]") ,  wrapAsync(editListing));


module.exports = router;