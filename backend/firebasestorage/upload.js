const bucket=require('../firebaseadmin')
const { promisify } = require('util');

const uploadFile = promisify((buffer, filename, mimetype,uuid, cb) => {
    const fileUpload = bucket.file(filename);
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: mimetype,
        metadata: {
            firebaseStorageDownloadTokens: uuid
          }
      },
    });
  
    blobStream.on('error', (error) => {
      console.error(error);
      cb({ error: 'An error occurred while uploading the file' });
    });
  
    blobStream.on('finish', () => {
      const fileURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${uuid}`;
      cb(null, fileURL);
    });
  
    blobStream.end(buffer);
  });

  module.exports=uploadFile