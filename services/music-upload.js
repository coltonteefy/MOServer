var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1"
});

var s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/mp3' || file.mimetype === 'audio/x-m4a') {
        cb(null, true)
    } else {
        cb(new Error('Invalid Mime Type, only wav, mp3 and m4a'), false);
    }
};

const upload = multer({
    fileFilter: fileFilter,
    storage: multerS3({
        s3: s3,
        bucket: 'music-on-app',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, 'uploads/musicUploads/' + Date.now().toString() + file.originalname.toLowerCase())
        }
    })
});

module.exports = upload;