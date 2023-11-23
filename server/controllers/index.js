const { INTERNAL_SERVER_EXECEPTION } = require("../shared/contants");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const { pool } = require("../database/db");

const addImage = async (req, res) => {
    try {
        const filePath = req.file.path;
        const savedImage = await uploadToCloudinary(filePath, { quality: "auto", folder: "single-images" });
        if (!savedImage.public_id) {
            return res.sendStatus(400);
        }
        const savedToDatabase = await pool.query("INSERT INTO images (public_id, public_url) VALUES ($1, $2) RETURNING *", [savedImage.public_id, savedImage.url]);
        if (!savedToDatabase) {
            return res.sendStatus(500);
        }
        return res.status(200).json({ message: "file saved", file: savedToDatabase[0] });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addMutipleImage = async (req, res) => {
    try {
        const files = req.files;
        const savedImages = [];
        for (let i = 0; i < files.length; i++) {
            const savedImage = await uploadToCloudinary(files[i].path, { quality: "auto", folder: "images" });
            if (!savedImages) {
                return res.sendStatus(400);
            }
            const savedToDatabase = await pool.query(
                'INSET INTO images (image_id, image_url) VALUES ($1, $2) RETURNING *',
                [savedImage.public_id, savedImage.url]
            );
            savedImages.push(savedToDatabase);
        };
        if (savedImages.length != files.length) {
            for (let i = 0; i < savedImages.length; i++) {
                const deletedImage = await deleteFromCloudinary(savedImages[i].public_id);
                if (!deletedImage) {
                    return sendStatus(500);
                }
                const deleteFromDatabase = await pool.query(
                    'ALTER TABLE images DROP COLUMN WHERE image_id=$1', [savedImages[i].public_id]
                )
                if (!deleteFromDatabase) {
                    return sendStatus(500);
                }
            }
            return res.sendStatus(500);
        };
        return res.status(200).json({ message: 'success', images: [...savedImages] });
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