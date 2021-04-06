const multer = require('multer');
const path = require("path")
const fs = require('fs')
const gcManager = require("./GoogleCloudManager");

const IMAGE_FILE_TYPES = /jpeg|jpg|png/
const FILE_SIZE_LIMIT = 3 //in MBs
const FILE_DESTINATION = "public/uploads/profiles/img"

function getImageUploader(imageAttribute) {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {      
            // Uploads is the Upload_folder_name
            cb(null, FILE_DESTINATION)
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + ".jpg")
        }
    })

    const maxSize = FILE_SIZE_LIMIT * 1000 * 1000;
        
    var upload = multer({ 
        storage: storage,
        limits: { fileSize: maxSize },
        fileFilter: function (req, file, cb){
        
            // Set the filetypes, it is optional
            var filetypes = IMAGE_FILE_TYPES;
            var mimetype = filetypes.test(file.mimetype);
      
            var extname = filetypes.test(path.extname(
                        file.originalname).toLowerCase());
            
            if (mimetype && extname) {
                return cb(null, true);
            }
          
            cb("Error: File upload only supports the "
                    + "following filetypes - " + filetypes);
          } 
      
    }).single(imageAttribute); 

    return upload
}

function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err)
          return
        } 
    })
}

function clearUploadCache() {

    fs.readdir(FILE_DESTINATION, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(FILE_DESTINATION, file), err => {
            if (err) throw err;
          });
        }
      });
}

module.exports = {
    getImageUploader,
    deleteFile,
    clearUploadCache
};