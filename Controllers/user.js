const User = require("../Models/user");

module.exports.renderSignUpForm = (req, res) => {
    res.render("../Views/Users/signup.ejs");
}


module.exports.signUp = async (req, res,next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        //console.log(registeredUser);  
        req.logIn(registeredUser , (err)=>{
        if(err){
            return next(err);
        } 
           req.flash("success" , "Welcome to StaySphere!") ; 
           res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message); // isse error aane pr kisi aur page pr nahi pohochenge humlog , bas same page pr flash message aayega containing error message.
        res.redirect("/signup");
    }
}


module.exports.renderLoginForm = (req, res) => {
    res.render("../Views/Users/login.ejs");
}

module.exports.logIn = async (req, res) => {
    //  passport.authenticate() ek middleware hai jo post route mai login se pehle authentication ke liye use hota hai
    console.log("Hello");
    req.flash( "success" , "Welcome back to StaySphere"); 
  //res.redirect("/listings");
  // res.redirect((req.session.redirectUrl)); yha tk aane tk req.session mai jo redirectUrl tha vo delete ho chuka hoga 
  if(res.locals.redirectUrl){
  res.redirect(res.locals.redirectUrl);
}else{
    res.redirect("/listings"); 
}
}

module.exports.logOut = (req,res,next)=>{
    req.logOut((err)=>{
    if(err){
       return  next(err);  // next ko return isliye kiya taki , last mai kbhi  niche ki koi lines execute na ho 
}
    req.flash("success","You are Logged out!");
    res.redirect("/listings");
})
};  