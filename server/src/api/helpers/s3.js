const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KET;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

function uploadFile(file, filename) {
  if (!file) return Promise.resolve();

  if (process.env.NODE_ENV === 'test') return Promise.resolve({ key: filename });

  if (process.env.NODE_ENV === 'development') {
    const filePath = path.join(__dirname, '../../../public', filename);
    const fileStream = fs.createWriteStream(filePath);
    fileStream.write(file.buffer);
    fileStream.end();
    return Promise.resolve({ key: filename });
  }
  const fileStream = file.buffer;
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: filename,
    ContentType: file.mimetype,
  };

  return s3.upload(uploadParams).promise();
}

function deleteFile(filename) {
  if (process.env.NODE_ENV === 'test') return Promise.resolve();

  if (process.env.NODE_ENV === 'development') {
    const filePath = path.join(__dirname, '../../../public', filename);
    fs.unlink(filePath, (err) => {
      if (err) throw err;
    });
    return Promise.resolve();
  }
  const deleteParams = {
    Bucket: bucketName,
    Key: filename,
  };

  return s3.deleteObject(deleteParams).promise();
}

module.exports = {
  uploadFile,
  deleteFile,
};
