const express = require("express");
const { uploadFile, setFilterTypes } = require("../middlewares/multer");
const {
    addImage,
    addMutipleImage,
    addImagesWithDifferentFields,
    addFile,
    addMultipleFile,
    addFilesWithDifferentFields,
    addAudioFile,
    addMultipleAudioFiles,
    addAudioFilesWithDifferentFields,
    addVideoFile,
    addMultipleVideoFiles,
    addVideoFilesWithDifferentFields
} = require("../controllers");

const router = express.Router();

router
    .post("/image/single", setFilterTypes(/.jpeg|.jpg|.png/), uploadFile.single('image'), addImage)
    .post("/image/multi", setFilterTypes(/jpeg|jpg|png/), uploadFile.array('images', 10), addMutipleImage)
    .post("/image/fields", setFilterTypes(/jpeg|jpg|png/), uploadFile.fields(
        [
            { name: 'profile', maxCount: 1 },
            { name: "images", maxCount: 10 }
        ]
    ), addImagesWithDifferentFields)
    .post("/file/single", addFile)
    .post("/file/multi", addMultipleFile)
    .post("/file/fields", addFilesWithDifferentFields)
    .post("/audio/single", addAudioFile)
    .post("/audio/multi", addMultipleAudioFiles)
    .post("/audio/fields", addAudioFilesWithDifferentFields)
    .post("/video/single", addVideoFile)
    .post("/video/multi", addMultipleVideoFiles)
    .post("/video/fields", addVideoFilesWithDifferentFields)


module.exports = router;