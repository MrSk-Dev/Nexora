const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true});
}

// Storage engine - saves files to disk with a unique name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null,`${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = allowedTypes.test(file.mimetype);

    if(isValidExt && isValidMime){
        cb(null, true);
    } else {
       cb(new Error('Only .jpeg, .jpg, .png, and .webp image files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 5 * 1024 * 1024 }, // 5MB Per file
});

module.exports = upload;
