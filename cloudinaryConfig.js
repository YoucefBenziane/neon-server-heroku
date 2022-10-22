const cloudinary = require('cloudinary');
cloudinary.config({ 
    cloud_name: "hvbfg6mxl", 
    api_key: "828521362497395",
    api_secret: "zyKK4OozAclYvfnOP41XwcjInM4"
  });

exports.uploads = (file) =>{
        return new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload(file, (err, url) => {
            if (err) return reject(err);
            return resolve(url);
          })
        });
}
