const path = require("path");
const fsPromise = require("fs").promises;

const RemoveFileFromFileStorage = async (filePath) => {
    const fullPath = path.join(__dirname, "uploads", filePath);
    console.log(fullPath);
    try {
        await fsPromise.unlink(fullPath);
        console.log(`file in ${fullPath} has been removed`);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    };
};

module.exports = { RemoveFileFromFileStorage };