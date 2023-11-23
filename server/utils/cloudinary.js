const { cloudinary } = require("../config/cloudinary.config");

const uploadToCloudinary = async (filePath, options) => {
    return await cloudinary.uploader.upload(filePath, { ...options });
};

const deleteFromCloudinary = async (public_id) => {
    return await cloudinary.uploader.destroy(public_id);
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
}