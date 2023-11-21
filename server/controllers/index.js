const { INTERNAL_SERVER_EXECEPTION } = require("../shared/contants");
const { uploadToCloudinary } = require("../utils/cloudinary");

const addImage = (req, res) => {
    try {
        const filePath = req.file.path;
        return res.status(200).json({ message: "file saved" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addMutipleImage = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addImagesWithDifferentFields = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addFile = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addMultipleFile = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addFilesWithDifferentFields = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addAudioFile = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addMultipleAudioFiles = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addAudioFilesWithDifferentFields = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addVideoFile = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addMultipleVideoFiles = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addVideoFilesWithDifferentFields = (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

module.exports = {
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
}