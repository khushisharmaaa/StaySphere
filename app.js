if(process.env.NODE_ENV != "production"){  // .env file ko hum bas development phase mai use karte hai , production phase mai use nahi karte , mtlb jb hum inn files ko deploy karenge , ya github pr upload karenge , tb .env file ko bilkul upload nahi karna hai , kyuki uske andar hamare important credentials hote hai. 
require('dotenv').config();             
}                   // ye line env files ko backend ke saath integrate karti hai ,  & iss line se hum environmental variables ko kisi bhi file mai use kar sakte hai 
//console.log(process.env); // isse sare environmental variables print ho jayenge , but we only want SECRET from it , mtlb vo variables jo humne banaye hai , ye SECRET to bs example hai 
//console.log(process.env.SECRET);     .env mai hum jo bhi environmental variables save karate hai , unko hum process.env se access karte hai.

const express = require("express");
const app=express();
const wrapAsync = require("./Utils/wrapAsync.js");
const { listingSchema , reviewSchema } = require("./Schema.js");
const ExpressError = require("./Utils/ExpressError.js");
const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/reviews.js");
const userRouter = require("./Routes/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

const multer = require("multer");  // Hum new form ka data multipart form mai bhej rahe hai jo backend ko toh samaj nahi aayega   ,, toh usee parse karne ke liye taki backend ko samaj aaye , we will use a new functionility / Package named 'multer' , ye multer package form ke data se files ko nikalega & automatically unn files ko ek 'uploads' naam  ka folder banake usme store kar dega.
const upload = multer({dest:'uploads/'}); // Isme hame batana padta hai ki , form se jo bhi files aayengi vo hum kaha pe save karwana chahte hai 

// const port = process.env.PORT;


//mongoose 
const mongoose = require("mongoose");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log("Some Error in DB");
});
async function main() {
  await mongoose.connect(dbUrl);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}




// Sessions ko Project mai add karna 
const session = require("express-session");

// Now we will store our session related information in a MongoStore
const MongoStore = require('connect-mongo'); // will create a mongostore for us jisme sari session related info store hogi like cookies , expiry time etc , pehle ye info bas ek local storage mai bydefault store hoti thi jo bas development side mai use krne layak thi , production side ke liye we will use connect-mongo/mongostore. 

const store = MongoStore.create({  // isse hamare session ki info atlas database ke andar store hogi jiska humne yaha dbUrl diya hai , agar we want ki local database mai store ho , toh we will pass mongoUrl here , basically mongoDb database ka Url pass karna hai jisme session ki info store karani hai 
    mongoUrl : dbUrl,
    crypto:{  // Encryption ke liye aise crypto ke andar likhna hota hai secret ko , otherwise sidha bas secret:   aise bhi likh sakte hai 
     secret:process.env.SECRET, 
    } ,
    touchAfter: 24*3600,                  // jab hum google pr insta login krke use krke tab cut kr dete hai , badmai firse insta open krne pr hame firse login nahi karna padta kyuki ek specific time tk session ki information stored rehti hai ,mtlb jo humne login kiya tha , uski info session mai store rehti hai for some specific time , ab ye time  kitna hoga ye hum batayenge by using this  'touchAfter' 
})                  // .create() is a  method for creating a new mongostore. 

store.on("error" , ()=>{  // agar mongostore mai koi error aaye toh 
    console.log("Error in MONGO SESSION STORE" , err);
});

const sessionOptions = {
    // store:store, aise bhi likh skte hai ya sidha bs store bhi likh skte hai 
   store,
   secret :process.env.SECRET,
   resave:false , 
   saveUninitialized:true,
   // Using Cookie in Project 
   cookie:{
    expires: Date.now() + 7*24*60*60*1000 , 
    maxAge : 7*24*60*60*1000 ,
    httpOnly:true,                  // security related hai ye chij httpOnly:true ,, Cross scripting attacks se prevent krne ke liye we set httpOnly to true
   }
};
app.use(session(sessionOptions));




// ppassport session ko bhi use karta hai , thats why usko hum session & flash ke baad likhenge 

// passport.initialize()
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // hum chahte hai ki jo bhi users aaye vo local strategy ke through authenticate hone chahiye , & ye authentication krne ke liye we use the authenticate method --- which is a static method added bydefault by passport-local-mongoose 

passport.serializeUser(User.serializeUser());   // user related sari info ko session ke andar store karna padega ,,, like jaise hi ekbar user ne login kiya , usko session ke andar  serialise karna padega hame ,mtlb uski info store krni padegi , taki use baar baaar login nahi krna padega means serialization.

passport.deserializeUser(User.deserializeUser());  // ekbar user ne session khatam kr liya , uski info unstore karni/remove krni padegi session se , which means deserializing user.



// Using Flash in Project 
const flash=require("connect-flash");
app.use(flash());
app.use((req,res,next)=>{              // MiddleWare ---> Har request mai run hoga ,, & ye local variables jo isme bana rahe hai , ye hum kisi bhi file mai access kar sakte hai like ejs templates
res.locals.success = req.flash("success");  // ye newlist flash ek array banega 
res.locals.error= req.flash("error");
res.locals.currentUser =  req.user;  // abhi jiss user ka session chal raha hai , uski info store karega currentUser & isko hum fir kisi bhi EJS template mai use/access kar sakte hai. 
next();
});










//method-override package
const methodOverride = require("method-override");
app.use(methodOverride("_method"));




// ejs-mate package          -- includes jaisa kaam karta hai 
const ejsMate = require("ejs-mate");
app.engine('ejs' , ejsMate);



const path = require("path");
// For using static files in public folder
app.use(express.static(path.join(__dirname,"/public")));

// generally hmesha hi likhte hai 
app.set("viewengine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());




// Reviews ki File  and Listing ki file 
const Review = require("./Models/review.js");
const Listing = require("./Models/listing.js");  // ../Models/listing.js means Models folder ke andar jao & listing.js ko le aao 



app.listen(8080 , ()=>{
    console.log("Server is Listening to Port 8080");
});

// Create Demo User 
app.get("/demouser" , async (req,res)=>{
       let fakeUser = new User({
        email:"student@gmail.com",
        username:"Delta Student",   // ab userSchema ke andar username nhi likha tha humne , still yaha use kr pa rhe hai kyuki passport-local-mongoose automatically khudse username & password add kar deta hai.
        });

        let registeredUser = await User.register(fakeUser , "Helloword");  // ye register ek static function hai , jo fakeUser ko store kara dega with password Helloworld  ,,,, ye register function khudse check kr leta hai ki whether the username is unique or not. 
        // ye register method ek asynchronous function hai. 
        console.log(registeredUser);
        res.send(registeredUser);
});



/*
// Root
app.get("/" , (req,res)=>{
    res.send("Root is Working");
});
*/
/*
app.get("/testListing" , async (req,res)=>{
    let sampleListing = new Listing ({
        title : "My New Villa" ,
        description : "By the Beach",
        price:1200 , 
        location : "Calangute, Goa",
        country :"India",
    });

    await sampleListing.save();
    console.log("Sample was Saved");
    res.send("Successful Testing");

});
*/


app.use("/listings" , listingRouter );   // Jitne bhi listings ke routes/requests the , uski jagah pr bas ye ek single line we have written ,,, by restructuring the app.js file. 
app.use("/listings/:id/reviews" , reviewRouter); // Jitne bhi reviews ke routes/requests the , uski jagah pr bas ye ek single line we have written ,,, by restructuring the app.js file.
// ye jo reviews ke case mai /listings/:id/reviews likha hai usme se id yahi app.js mai reh jati hai , vo dusri jagah nhi pohoch pati issliye Routes/reviews.js mai jab hum listing dhund rhe hote hai in router.post mai tb listing mil hi nhi pati , kyuki waha id pohochi hi nahi & we r tring to do findById toh listing undefined aayegi , jisse hum naya review add hi nahi kar payenge kyuki error aa jaygea--> "cannot read properties of null(readings reviews) "  ,,,,,,,,,,,,, toh aisa na ho & ye id pohoche reviews.js mai bhi so we use a external option mergeParams 

//  ye jo 2 Lines hai upar wali , unme /listings  and  /listings/:id/reviews parent paths hai  & Router mai review.js , listing.js mai jo "/" , "/:reviewid" etc vo child paths hai.... toh aise jab bhi parent path mai koi parametre ho like yaha jaise  "/listings/:id/reviews" mai id hai ,, & vo callbacks mai use ho sakte hai ,  toh un parametres ko dusre files mai bhejne ke liye we have to set mergeParams:true; in the router object jaise yaha we have done  :  const router = express.Router({mergeParams:true});  kyuki reviews.js mai  reviews ke create route mai hame listing find krne ke liye id chahiye thi , jo yaha parent path mai present hai , toh ye waha jaye issliye mergeParams:true; kiya humne router mai.  

app.use("/" , userRouter);






// Different Error handlers : 

app.use((err , req , res , next)=>{
    let {statusCode=500 , message="Something Went Wrong"} = err;
    res.render("./listings/error.ejs",{err});
    
   // res.status(statusCode).send(message); 
});



app.all("*" , (req,res,next)=>{                  // "*" mtlb sari ki sari jo incoming request hai , uske saath match kardo 
    next(new ExpressError(404,"Page Not Found"));
});                       
    
    
// Error Handler : 
app.use((err,req,res,next)=>{
   res.send("Something went Wrong!!");   
});

