// Middleware
const util    = require("util");
const multer  = require("multer");
const utils   = require("../dist/utils");
const path    = require('path');
const maxSize = 50 * 1024 * 1024;

let storage = multer.diskStorage({
  // Upload file path Setting
  destination: (req, file, cb) => {
    cb(null, __basedir + "/resources/static/assets/uploads/");
  },
  // Upload file name Setting
  filename: (req, file, cb) => {
    cb(null, utils.simple_date() + "_" + file.originalname);
  }
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);



// notice storage
const notice_upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // cb(null, '/home/ubuntu/dev/dandi/server/upload/notice/');
      cb(null, '/var/www/server/upload/notice/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
    limits: {
        fileSize: 50 * 1024 * 1024       //50MB
    }
  }),
});

// forum storage
const forum_upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/var/www/server/upload/forum/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
    limits: {
        fileSize: 50 * 1024 * 1024       //50MB
    }
  }),
});

// ir storage
const ir_upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/var/www/server/upload/ir/');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
    limits: {
      fileSize: 50 * 1024 * 1024
    }
  }),
});

// introduce storage
const introduce_upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/var/www/server/upload/introduce/');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
    limits: {
      fileSize: 50 * 1024 * 1024
    }
  }),
});


module.exports = {
  uploadFileMiddleware,
  notice_upload,
  forum_upload,
  ir_upload,
  introduce_upload,
};
