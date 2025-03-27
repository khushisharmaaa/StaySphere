const mongoose=require("mongoose"); 
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

const listingSchema = new Schema({
   title :{
    type : String , 
    required :true , 
},
   description : String ,
  // image: String , 
       // set : (v) => v==="" ? "https://unsplash.com/photos/the-sun-is-setting-behind-a-tree-in-a-foggy-field-SO-2dSyxPZw": v,           // in this way , we can set a default value based on some condition for any field in the model. 
   image:{
     url : String , 
     filename :String , 
   },   
   price : Number ,  
   location : String ,
   country: String  , 
   reviews: [
          {
           
            type : Schema.Types.ObjectId , 
            
            ref:"Review",

          }
     ],
     owner:{
      type:Schema.Types.ObjectId,
      ref:"User", 
     }
});


// Mongoose post middleware for deletion of listings ----> so that koi listing delete karne pr , uske sare reviews bhi delete ho jaye Database se 
listingSchema.post("findOneAndDelete" , async(listing)=>{
    if(listing){
 await Review.deleteMany({_id:{$in: listing.reviews }});
}
});



const Listing = mongoose.model("Listing",listingSchema);

module.exports=Listing;


