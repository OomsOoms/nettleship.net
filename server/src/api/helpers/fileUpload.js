const path = require('path');
const fs = require('fs');

// upload user avatar
async function uploadAvatar(file, filename) {
    // check if the file is an image
    if (!file.mimetype.startsWith('image')) {
        throw Error.invalidInput('File must be an image');
    }
    // check if the path exists, if not create it
    const dir = path.join(__dirname, '../../../public/uploads/avatars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    // save the file to the uploads directory
    const filePath = path.join(dir, filename);
    const fileStream = fs.createWriteStream(filePath);
    fileStream.write(file.buffer);
    fileStream.end();
    return '/uploads/avatars/' + filename;
}

async function deleteFile(file) {
    // check if the file exists
    const filePath = path.join(__dirname, '../../../public', file);
    if (fs.existsSync(filePath)) {
        // delete the file
        fs.unlinkSync(filePath);
    }
}

module.exports = {
    uploadAvatar,
    deleteFile
};
