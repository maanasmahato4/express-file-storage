const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}${file.originalname}`;
        cb(null, uniqueName);
    }
})

const uploadFile = multer({
    storage: storage
})

module.exports = { uploadFile };