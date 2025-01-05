const Listing = require("../Models/listing");


module.exports.index = async (req,res)=>{
    const alllistings =await Listing.find({});
    res.render("./listings/index.ejs" , {alllistings});
}


module.exports.renderNewForm = (req,res)=>{          // Iss new route ko agar hum show route se niche rakhenge Code mai , toh JS isme humne jo listings/new likha hai , isme 'new' ko id samaj lega & usko dhundne lag jayega jisse error aa jayega ,, Isliye iss New Route ko hum Show Route ke upar hi rakhenge 
    console.log(req.user); // request mai bydefault user ki sari information store ho jati hai ,,, jaise hi user login krta hai , request object mai user related information store ho jati hai. 
    res.render("./listings/new.ejs");
 }

 module.exports.showListing = async (req,res)=>{
         let {id}=req.params;
         let listing = await Listing.findById(id)
         .populate({
             path: "reviews",
             populate: {
                 path:"author",
             },
         })
          .populate("owner"); // agar reviews ke authors ka naam unpe print karana hai , toh reviews ke authors ko bhi populaate karana padega  , So we will use nested populate.
       //   listing.reviews.map((el)=>console.log(el.owner._id));
        //   if(req.user) {console.log(req.user._id);  }
         if(!listing){
             req.flash("error" , "Requested Listing does not exist" );
             res.redirect("/listings");
         }
         res.render("./listings/show.ejs" , {listing});
  }


module.exports.createListing = async(req,res,next)=>{

let url = req.file.path;
let filename = req.file.filename;
//console.log(url , " " , filename);


    /*  
    Aise sidha Schema Validation yaha bhi kar skte hai yaa alag se function banake bhi kr sakte hai & fir uss function ko As middleware pass kar denge iss function mai , like we have in this code , see function named "validateListing"
    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    */
    
    
    /* Correct Method but we can do in a shorter way 
    
    let {title , description , image , price , country , location} = req.body;
    
    const newListing = new Listing({
    title : title,
    description:description,
    image:{
        filename:'listingimage', 
        url:image 
    },
    price:price,
    country:country,
    location:location,
    });
    */
    // we can also do as follows : 
    
    
    const newListing = new Listing(req.body.listing);  // isme koi owner ki value nahi gayi abhi 
    
    newListing.owner = req.user._id;  // ye humne owner mai current loggedin user ki id daal di 
    newListing.image = {url , filename};    
    await newListing.save(); 
    console.log(newListing.image);

    req.flash("success" , "New Listing Created");
    res.redirect("/listings");    
 }


 module.exports.renderEditForm = async(req,res)=>{
         let {id}=req.params;
         let listing =await  Listing.findById(id);
 
         if(!listing){
             req.flash("error" , "Requested Listing does not exist" );
             res.redirect("/listings");
         }
        let originalImageUrl = listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload" , "/upload/w_250");
        res.render("./listings/edit.ejs" , {listing , originalImageUrl});
  }

    

  module.exports.editListing = async(req,res)=>{
    let {id}=req.params;
    //console.log(req.params);
    //console.log(req.body);
 
        /* Correct method Of Updating
        await Listing.findByIdAndUpdate(id , 
          { 
            description:req.body.description,
            price : req.body.price,
            location:req.body.location , 
            country:req.body.country,
          }   
         );
         */
    
    /*
         if(!req.body.listing){
        throw new ExpressError(400,"Send Valid data for listing");                    // Error code 400 means Client ki galti ki vajah se server site pr error aa gaya. 
    }
    */
    
    
    // Alternate Way of upfating ---> we will deconstruct the listing object yaaa sidha req.body ko hi deconstruct kar denge kyuki req.body ek object ki tarah  hi aayegi 
   //     console.log(req); 

   // let listing = await Listing.findById(id);

      /*
       ye jo check kr rhe , iska middleware hi bana denge taki sare hi routes mai ise apply kar paaye 
        if(!(req.user && listing.owner._id.equals(req.user._id))) {  // Check kar rahe ki jo user listing ko edit krne ka try kar raha hai , kya vo iss listing ka Owner hai ya nahi  
            req.flash("error" , "You dont have permission to edit");
           return  res.redirect(`/listings/${id}`);
        }

      */ 

      let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});
  
      if(typeof req.file !== "undefined") {       // agar humne edit form mai image upload kari ho tabhiii req.file mai kuch hoga , ow vo undefined hoga . 
      let url = req.file.path;
      let filename = req.file.filename;
  
      listing.image = {url , filename};
      await listing.save();
    }
       req.flash("success" , "Listing Updated!");
       res.redirect(`/listings/${id}`);

}


module.exports.destroyListing = async (req,res,next)=>{
    let {id}=req.params;

    let listing = await Listing.findById(id);

   

await Listing.findByIdAndDelete(id);
req.flash("success","Listing Deleted!");
res.redirect("/listings");

    
}