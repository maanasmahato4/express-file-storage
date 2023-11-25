const { INTERNAL_SERVER_EXECEPTION } = require("../shared/contants");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const { pool } = require("../database/db");

const addImage = async (req, res) => {
    try {
        const filePath = req.file.path;
        const savedImage = await uploadToCloudinary(filePath, { quality: "auto", folder: "images" });
        if (!savedImage.public_id) {
            return res.sendStatus(400);
        }
        const savedToDatabase = await pool.query("INSERT INTO images (public_id, public_url) VALUES ($1, $2) RETURNING *", [savedImage.public_id, savedImage.url]);
        if (!savedToDatabase) {
            return res.sendStatus(500);
        }
        return res.status(200).json({ message: "file saved", file: savedToDatabase[0] });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
    };
};

const addMutipleImage = async (req, res) => {
    try {
        const files = req.files;
        const savedImages = [], savedInDatabase = [];
        for (let i = 0; i < files.length; i++) {
            const savedImage = await uploadToCloudinary(files[i].path, { quality: "auto", folder: "images" });
            if (!savedImage) {
                const notDeletedFromCloudinary = [], notDeletedFromDatabase = [];
                for (let i = 0; i < savedImages.length; i++) {
                    const deletedImage = await deleteFromCloudinary(savedImages[i].public_id);
                    if (!deletedImage) {
                        notDeletedFromCloudinary.push(savedImages[i]);
                    }
                    const deleteFromDatabase = await pool.query(
                        'DELETE FROM images WHERE public_id = $1', [savedImages[i].public_id]
                    )
                    if (!deleteFromDatabase) {
                        notDeletedFromDatabase.push(savedImages[i]);
                    }
                }
                return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, extraInfro: { notDeletedFromCloudinary, notDeletedFromDatabase } });
            }
            savedImages.push(savedImage);
        };

        for (let i = 0; i < savedImages.length; i++) {
            const savedToDatabase = await pool.query(
                'INSERT INTO images (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [savedImages[i].public_id, savedImages[i].url]
            );
            if (!savedInDatabase) {
                return res.sendStatus(500);
            }
            savedInDatabase.push(savedToDatabase.rows[0]);
        };

        if (savedImages.length != savedInDatabase.length) {
            const notDeletedFromCloudinary = [], notDeletedFromDatabase = [];
            for (let i = 0; i < savedImages.length; i++) {
                const deletedImage = await deleteFromCloudinary(savedImages[i].public_id);
                if (!deletedImage) {
                    notDeletedFromCloudinary.push(savedImages[i]);
                };
                const deleteFromDatabase = await pool.query(
                    'DELETE FROM images WHERE public_id = $1', [savedImages[i].public_id]
                );
                if (!deleteFromDatabase) {
                    notDeletedFromDatabase.push(savedImages[i]);
                };
            };
            return res.status(500).json({
                error: INTERNAL_SERVER_EXECEPTION,
                extraInfro: { notDeletedFromCloudinary, notDeletedFromDatabase }
            });
        };
        return res.status(200).json({ message: 'success', images: [...savedImages] });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
    };
};

const addImagesWithDifferentFields = async (req, res) => {
    const allImages = [], savedInCloudinary = [], savedInDatabase = [];
    try {
        const { profile, images } = req.files;
        // pushing all the image files form the request to an array
        allImages.forEach(file => {
            allImages.push(file);
        });

        for (let i = 0; i < images.length; i++) {
            allImages.push(images[i]);
        };
        // adding all the images from the allImages array to cloudinary
        for (let i = 0; i < allImages.length; i++) {
            const savedImageInCloudinary = await uploadToCloudinary(allImages[i].path, { quality: 90, folder: "images" });
            if (!savedImageInCloudinary) {
                const notDeletedFromCloudinary = [];
                for (let i = 0; i < savedInCloudinary.length; i++) {
                    const deletedFromCloudinary = await deleteFromCloudinary(savedInCloudinary[i].public_id);
                    if (!deletedFromCloudinary) {
                        notDeletedFromCloudinary.push(allImages[i]);
                    };
                };
                return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, notDeletedFromCloudinary });
            };
            savedInCloudinary.push(savedImageInCloudinary);
        };
        // storing data to the database
        for (let i = 0; i < savedInCloudinary; i++) {
            const savedImageInDatabase = await pool.query(
                'INSERT INTO images (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [savedInCloudinary[i].public_id, savedInCloudinary[i].url]
            );
            if (!savedImageInDatabase) {
                const notDeletedFromDatabase = [];
                for (let i = 0; i < savedInCloudinary.length; i++) {
                    const deletedFromCloudinary = await pool.query(
                        'DELETE FROM images WHERE public_id = $1', [savedInCloudinary[i].public_id]
                    );
                    if (!deletedFromCloudinary) {
                        notDeletedFromDatabase.push(savedInCloudinary[i]);
                    };
                };
                return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, notDeletedFromDatabase })
            }
            savedInDatabase.push(savedImageInDatabase.rows[0]);
        };

        /*  if (savedInDatabase.length != savedInCloudinary.length) {
             return res.status(500).json({
                 error: INTERNAL_SERVER_EXECEPTION, message: "some images were not saved", images: savedInDatabase
             });
         }; */

        if (savedInDatabase.length != savedInCloudinary.length) {
            console.log(savedInDatabase.length, savedInCloudinary.length);
            for (let i = 0; i < savedInCloudinary.length; i++) {
                const deletedImageFromCloudinary = await deleteFromCloudinary(savedInCloudinary[i].public_id);
                if (!deletedImageFromCloudinary) {
                    return res.sendStatus(500);
                };
                const deletedImageDataFromDatabase = await pool.query(
                    'DELETE FROM images WHERE image_id = $1',
                    [deletedImageFromCloudinary.public_id]
                );
                if (!deletedImageDataFromDatabase) {
                    return res.sendStatus(500);
                };
            };
        };
        return res.status(200).json({ message: "success", images: savedInDatabase });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
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