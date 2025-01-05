const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
     email:{
        type:String , 
        required:true,
     }
}); // password and username passport-local mongoose automatically khud hi store kara lega , chahe hum unko field/schema ke andar mention kare ya na kare. 

userSchema.plugin(passportLocalMongoose);  // ye plugin issliye kiya hai kyuki ye passport-local-mongoose ka plugin automatically username , hashing , salting and hashed password ko implement kar dega. SO inn sbko hume scratch se develop krne ki jarurat nahi padii 

module.exports=mongoose.model('User',userSchema);