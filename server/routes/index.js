const express = require("express");
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
    .post("/image/single", addImage)
    .post("/image/multi", addMutipleImage)
    .post("/image/fiels", addImagesWithDifferentFields)
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