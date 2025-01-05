const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ // Code ko bata rahe ki cloudinary ko access kaise karna hai , Cloudinary account ke bare mai bata rahe hai.
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY ,
    api_secret:process.env.CLOUD_API_SECRET 
})

const storage = new CloudinaryStorage({  // batayenge ki cloudinary ke konse folder mai jake files Store karni hai 
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormats : ["png" , "jpg" , "jpeg"], // supports promises as well
     
    },
  });


  module.exports = {
    cloudinary , 
    storage
  }