const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 
const cloudinary = require('../config/cloudniary'); 
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'events', 
        format: async (req, file) => 'png',
        public_id: (req, file) => file.originalname.split('.')[0], 
    },
});

const upload = multer({ storage });

module.exports = upload;
