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
    addVideoFilesWithDifferentFields,
    deleteById
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
    .post("/file/single", setFilterTypes(/.pdf|.docx/), uploadFile.single('file'), addFile)
    .post("/file/multi", setFilterTypes(/.pdf|.docx/), uploadFile.array('files'), addMultipleFile)
    .post("/file/fields", setFilterTypes(/.pdf|.docx/), uploadFile.fields(
        [
            { name: 'file', maxCount: 1 },
            { name: 'files', maxCount: 10 }
        ]
    ), addFilesWithDifferentFields)
    .post("/audio/single", setFilterTypes(/.mp3/), uploadFile.single('audio'), addAudioFile)
    .post("/audio/multi", setFilterTypes(/.mp3/), uploadFile.array('audios'), addMultipleAudioFiles)
    .post("/audio/fields", setFilterTypes(/.mp3/), uploadFile.fields(
        [
            { name: 'audio', maxCount: 1 },
            { name: 'audios', maxCount: 10 }
        ]
    ), addAudioFilesWithDifferentFields)
    .post("/video/single", setFilterTypes(/.mp4/), uploadFile.single('video'), addVideoFile)
    .post("/video/multi", setFilterTypes(/.mp4/), uploadFile.single('videos'), addMultipleVideoFiles)
    .post("/video/fields", setFilterTypes(/.mp4/), uploadFile.single(
        [
            { name: 'video', maxCount: 1 },
            { name: 'videos', maxCount: 10 }
        ]
    ), addVideoFilesWithDifferentFields)
    .delete("/delete/:id", deleteById)


module.exports = router;