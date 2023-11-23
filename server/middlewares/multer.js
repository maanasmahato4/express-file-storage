const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}${file.originalname}`;
        cb(null, uniqueName);
    }
});

const filter = (req, file, cb) => {
    const fileTypes = req.locals.fileTypes;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (!extname || !mimeType) {
        cb(new Error("file type not supported"));
    };
    cb(null, true);
}

const uploadFile = multer({
    storage: storage,
    fileFilter: filter
});

const setFilterTypes = (types) => {
    return (req, res, next) => {
        req.locals.fileTypes = types;
        next();
    }
};



module.exports = { uploadFile, setFilterTypes };