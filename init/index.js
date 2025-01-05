const mongoose = require("mongoose");

const initData = require("./data.js");  // ye initData ek object hoga kyuki app.js se humne ek object ki form mai hi sampleListing/data ko pass kiya hua hai 

const Listing=require("../Models/listing.js");

main().then(()=>{
    console.log("Connected to DB");
}).catch(()=>{
    console.log("Some Error in DB");
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  
}

const initDB =  async()=>{   // function for initialising the Data in the collection 

   await  Listing.deleteMany({}); // sara data uda diya pehle -- Listing ko khali kr diya 
   initData.data = initData.data.map((obj) => ({...obj , owner:"676f8c9a49d773e5e07d2601"}));
   await Listing.insertMany(initData.data);
   console.log("Data was initialised");

};

initDB();





