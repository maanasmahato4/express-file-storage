const { INTERNAL_SERVER_EXECEPTION } = require("../shared/contants");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const { pool } = require("../database/db");
const { RemoveFileFromFileStorage } = require("../utils/deleteFileFromFileStorage");
const { createTable } = require("../utils/createTable");

// Function to add an image
const addImage = async (req, res) => {
    try {
        // Get the file path from the request
        const filePath = req.file.path;

        // Upload the image to Cloudinary
        const savedImage = await uploadToCloudinary(filePath, { quality: "auto", folder: "images" });

        // Check if the image was successfully uploaded
        if (!savedImage.public_id) {
            return res.status(400).json({ error: 'Image upload failed', message: 'The image could not be uploaded to Cloudinary' });
        }

        // create table if not already created
        await createTable('images');

        // Save the image details to the database
        const savedToDatabase = await pool.query("INSERT INTO images (public_id, public_url) VALUES ($1, $2) RETURNING *", [savedImage.public_id, savedImage.url]);

        // Check if the image details were successfully saved to the database
        if (!savedToDatabase) {
            return res.status(500).json({ error: 'Database error', message: 'The image details could not be saved to the database' });
        }

        // Remove the image from local storage
        try {
            await RemoveFileFromFileStorage(filePath);
        } catch (error) {
            return res.status(500).json({ error: 'File removal error', message: 'The image could not be removed from local storage' });
        }

        // Send a success response
        return res.status(200).json({ message: "file saved", file: savedToDatabase[0] });
    } catch (error) {
        // Handle any other errors
        return res.status(500).json({ error: 'INTERNAL_SERVER_EXECEPTION', message: error.message });
    };
};


const addMutipleImage = async (req, res) => {
    try {
        const images = req.files;

        // create table if not already created
        await createTable('images');

        async function savedInCloudinary(filePath) {
            return await uploadToCloudinary(filePath, { quality: 90, folder: "images" });
        };
        async function savedInDatabase(image) {
            return await pool.query(
                'INSERT INTO images (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [image.public_id, image.url]
            )
        };

        const savedImagesInCloudinary = await Promise.all(images.map(image => savedInCloudinary(image.path)));
        const savedCloudinaryImagesDataInDatabase = await Promise.all(savedImagesInCloudinary.map(image => savedInDatabase(image)));

        if (savedImagesInCloudinary.length != savedCloudinaryImagesDataInDatabase.length) {
            const notDeletedFromCloudinary = [], notDeletedFromDatabase = [];
            savedImagesInCloudinary.forEach(
                async image => {
                    const deletedImage = await deleteFromCloudinary(image.public_id);
                    if (!deletedImage) {
                        notDeletedFromCloudinary.push(image);
                    };
                    const deleteFromDatabase = await pool.query(
                        'DELETE FROM images WHERE public_id = $1', [image.public_id]
                    );
                    if (!deleteFromDatabase) {
                        notDeletedFromDatabase.push(image);
                    };
                }
            );
            return res.status(500).json({
                error: INTERNAL_SERVER_EXECEPTION,
                extraInfro: { notDeletedFromCloudinary, notDeletedFromDatabase }
            });
        }
        return res.status(200).json({ message: 'success', images: savedCloudinaryImagesDataInDatabase });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
    }
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

        // create table if not already created
        await createTable('images');

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

const addFile = async (req, res) => {
    try {
        const file = req.file;
        let savedToCloudinary;
        try {
            savedToCloudinary = await uploadToCloudinary(file.path, { quality: 90, folder: "files" });
        } catch (error) {
            console.error('Failed to upload file to Cloudinary:', error);
            return res.status(500).json({ error: INTERNAL_SERVER_EXCEPTION, message: 'Failed to upload file to Cloudinary' });
        }

        // create table if not already created
        await createTable('images');

        let savedToDatabase;
        try {
            savedToDatabase = await pool.query(
                'INSERT INTO files (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [savedToCloudinary.public_id, savedToCloudinary.url]
            );
        } catch (error) {
            console.error('Failed to save file to database:', error);
            try {
                await deleteFromCloudinary(file.path);
            } catch (deleteError) {
                console.error('Failed to delete file from Cloudinary:', deleteError);
            }
            try {
                await RemoveFileFromFileStorage(file.path);
            } catch (deleteError) {
                console.error('Failed to delete file from local storage:', deleteError);
            }
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: 'Failed to save file to database' });
        }

        return res.status(200).json({ message: "success", data: savedToDatabase.rows[0] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: 'Unexpected error occurred' });
    };
};


const addMultipleFile = async (req, res) => {
    try {
        const files = req.files;

        // create table if not already created
        await createTable('images');

        async function SaveToCloudinary(filePath) {
            return await uploadToCloudinary(filePath, { quality: 100, folder: "files" });
        };
        async function SaveToDatabase(file) {
            return await pool.query(
                'INSET INTO files (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [file.public_id, file.url]
            )
        };

        let savedToCloudinary;
        try {
            savedToCloudinary = Promise.all(files.map(async file => {
                await SaveToCloudinary(file.path);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        };

        let savedToDatabase;
        try {
            savedToDatabase = Promise.all(savedToCloudinary.map(async file => {
                await SaveToDatabase(file);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        }

        return res.status(200).json({ message: "success", data: savedToDatabase });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addFilesWithDifferentFields = async (req, res) => {
    try {
        const { file, files } = req.files;
        const allFiles = [];
        allFiles.push(file);
        files.forEach(file => allFiles.push(file));

        // create table if not already created
        await createTable('images');

        async function SaveToCloudinary(filePath) {
            return await uploadToCloudinary(filePath, { quality: 100, folder: "files" });
        };
        async function SaveToDatabase(file) {
            return await pool.query(
                'INSET INTO files (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [file.public_id, file.url]
            )
        };

        let savedToCloudinary;
        try {
            savedToCloudinary = Promise.all(allFiles.map(async file => {
                await SaveToCloudinary(file.path);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        };

        let savedToDatabase;
        try {
            savedToDatabase = Promise.all(savedToCloudinary.map(async file => {
                await SaveToDatabase(file);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        }

        return res.status(200).json({ message: "success" });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addAudioFile = async (req, res) => {
    try {
        const file = req.file;
        let savedToCloudinary;
        try {
            savedToCloudinary = await uploadToCloudinary(file.path, { quality: 90, folder: "audios" });
        } catch (error) {
            console.error('Failed to upload file to Cloudinary:', error);
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: 'Failed to upload file to Cloudinary' });
        }

        // create table if not already created
        await createTable('audios');

        let savedToDatabase;
        try {
            savedToDatabase = await pool.query(
                'INSERT INTO audios (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [savedToCloudinary.public_id, savedToCloudinary.url]
            );
        } catch (error) {
            console.error('Failed to save file to database:', error);
            try {
                await deleteFromCloudinary(file.path);
            } catch (deleteError) {
                console.error('Failed to delete file from Cloudinary:', deleteError);
            }
            try {
                await RemoveFileFromFileStorage(file.path);
            } catch (deleteError) {
                console.error('Failed to delete file from local storage:', deleteError);
            }
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: 'Failed to save file to database' });
        }
        return res.status(200).json({ message: "success", data: savedToDatabase.rows[0] });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addMultipleAudioFiles = async (req, res) => {
    try {
        const files = req.files;

        // create table if not already created
        await createTable('audios');

        async function SaveToCloudinary(filePath) {
            return await uploadToCloudinary(filePath, { quality: 100, folder: "audios" });
        };
        async function SaveToDatabase(file) {
            return await pool.query(
                'INSET INTO audios (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [file.public_id, file.url]
            )
        };

        let savedToCloudinary;
        try {
            savedToCloudinary = Promise.all(files.map(async file => {
                await SaveToCloudinary(file.path);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        };

        let savedToDatabase;
        try {
            savedToDatabase = Promise.all(savedToCloudinary.map(async file => {
                await SaveToDatabase(file);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        }

        return res.status(200).json({ message: "success", data: savedToDatabase });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addAudioFilesWithDifferentFields = async (req, res) => {
    try {
        const { file, files } = req.files;
        const allFiles = [];
        allFiles.push(file);
        files.forEach(file => allFiles.push(file));

        // create table if not already created
        await createTable('audios');

        async function SaveToCloudinary(filePath) {
            return await uploadToCloudinary(filePath, { quality: 100, folder: "audios" });
        };
        async function SaveToDatabase(file) {
            return await pool.query(
                'INSET INTO audios (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [file.public_id, file.url]
            )
        };

        let savedToCloudinary;
        try {
            savedToCloudinary = Promise.all(allFiles.map(async file => {
                await SaveToCloudinary(file.path);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        };

        let savedToDatabase;
        try {
            savedToDatabase = Promise.all(savedToCloudinary.map(async file => {
                await SaveToDatabase(file);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        }

        return res.status(200).json({ message: "success" });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addVideoFile = async (req, res) => {
    try {
        const file = req.file;
        let savedToCloudinary;
        try {
            savedToCloudinary = await uploadToCloudinary(file.path, { quality: 90, folder: "videos" });
        } catch (error) {
            console.error('Failed to upload file to Cloudinary:', error);
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: 'Failed to upload file to Cloudinary' });
        }

        // create table if not already created
        await createTable('videos');

        let savedToDatabase;
        try {
            savedToDatabase = await pool.query(
                'INSERT INTO videos (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [savedToCloudinary.public_id, savedToCloudinary.url]
            );
        } catch (error) {
            console.error('Failed to save file to database:', error);
            try {
                await deleteFromCloudinary(file.path);
            } catch (deleteError) {
                console.error('Failed to delete file from Cloudinary:', deleteError);
            }
            try {
                await RemoveFileFromFileStorage(file.path);
            } catch (deleteError) {
                console.error('Failed to delete file from local storage:', deleteError);
            }
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: 'Failed to save file to database' });
        }
        return res.status(200).json({ message: "success", data: savedToDatabase.rows[0] });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addMultipleVideoFiles = async (req, res) => {
    try {
        const files = req.files;

        // create table if not already created
        await createTable('videos');

        async function SaveToCloudinary(filePath) {
            return await uploadToCloudinary(filePath, { quality: 100, folder: "videos" });
        };
        async function SaveToDatabase(file) {
            return await pool.query(
                'INSET INTO videos (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [file.public_id, file.url]
            )
        };

        let savedToCloudinary;
        try {
            savedToCloudinary = Promise.all(files.map(async file => {
                await SaveToCloudinary(file.path);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        };

        let savedToDatabase;
        try {
            savedToDatabase = Promise.all(savedToCloudinary.map(async file => {
                await SaveToDatabase(file);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        }

        return res.status(200).json({ message: "success", data: savedToDatabase });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const addVideoFilesWithDifferentFields = async (req, res) => {
    try {
        const { file, files } = req.files;
        const allFiles = [];
        allFiles.push(file);
        files.forEach(file => allFiles.push(file));

        // create table if not already created
        await createTable('videos');

        async function SaveToCloudinary(filePath) {
            return await uploadToCloudinary(filePath, { quality: 100, folder: "videos" });
        };
        async function SaveToDatabase(file) {
            return await pool.query(
                'INSET INTO videos (public_id, public_url) VALUES ($1, $2) RETURNING *',
                [file.public_id, file.url]
            )
        };

        let savedToCloudinary;
        try {
            savedToCloudinary = Promise.all(allFiles.map(async file => {
                await SaveToCloudinary(file.path);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        };

        let savedToDatabase;
        try {
            savedToDatabase = Promise.all(savedToCloudinary.map(async file => {
                await SaveToDatabase(file);
            }));
        } catch (error) {
            return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error.message });
        }

        return res.status(200).json({ message: "success" });
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    };
};

const deleteById = async (public_id) => {
    try {
        await deleteFromCloudinary(public_id);
    } catch (error) {
        return res.status(500).json({ error: INTERNAL_SERVER_EXECEPTION, message: error });
    }
}

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
    addVideoFilesWithDifferentFields,
    deleteById
}