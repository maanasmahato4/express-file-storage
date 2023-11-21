const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: 'dqn88yr6y',
    api_key: '825141699117774',
    api_secret: 'XlrXxTRQSHisQKwVeUyKexg-SFI',
    secure: true
});

module.exports = {cloudinary};