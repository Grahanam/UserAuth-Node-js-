require('dotenv').config()
var admin = require("firebase-admin");

//firebase Accountkey
var serviceAccount = require("./Firebaseservicekey.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_URL,
});

const bucket = admin.storage().bucket();

module.exports=bucket