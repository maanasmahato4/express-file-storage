const { cloudinary } = require("../config/cloudinary.config");

const uploadToCloudinary = async (filePath, file_type, options) => {
    if (file_type === 'video') {
        return await cloudinary.uploader.upload_large(filePath, { ...options });
    } else {
        return await cloudinary.uploader.upload(filePath, { ...options });
    };
};

const deleteFromCloudinary = async (public_id) => {
    return await cloudinary.uploader.destroy(public_id);
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
}