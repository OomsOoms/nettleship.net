const S3 = require('aws-sdk/clients/s3');

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
