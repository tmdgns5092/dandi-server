const jwt     = require("jsonwebtoken");
const jwtObj  = require("../config/config-jwt");
const util    = {};
var moment = require('moment'); require('moment-timezone'); moment.tz.setDefault("Asia/Seoul");


util.successTure = function(data){
  return {
    success:true,
    message:null,
    error:null,
    data:data,
    code:200
  }
}

util.successFalse = function(err, message, code) {
  if(!err && !message) message = 'data not found';
  return {
    success:false,
    message:message,
    error:(err)? util.parseError(err): null,
    data:null,
    code:code
  };
}

util.isLoggedin = function(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token) return res.status(903).send(util.successFalse(null, 'token is required!'));
  else {
    jwt.verify(token, jwtObj.secret, function(err, decoded) {
      if(err) return res.status(903).send(util.successFalse(err, null, 903));
      else {
        console.log(decoded);
        req.decoded = decoded;
        next();
      }
    });
  }
}

util.parseError = function(errors){
  var parsed = {};
  if(errors.name == 'ValidationError'){
    for(var name in errors.errors){
      var validationError = errors.errors[name];
      parsed[name] = { message:validationError.message };
    }
  } else if(errors.code == '11000' && errors.errmsg.indexOf('username') > 0){
    parsed.username = { message:'This username already exists!'};
  } else {
    parsed.unhandled = errors;
  }
  return parsed;
}

util.uk = function(obj) {
    if(obj){
        return obj;
    } else {
        return "";
    }
};

util.date = function() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

util.getFormatDate = function(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth());
  month = month >= 10 ? month: '0' + month;
  var day = date.getDate();
  day = day >= 10 ? day : '0' + day;
  return year + '-' + month + '-' + day;
}

util.simple_date = function() {
  return moment().format('YYYYMMDDHHmmss');
}

// 로그인 암호 대조
util.pbkdf2Async = function(crypto, salt, password) {
  return new Promise( (res, rej) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
      err ? rej(err) : res({key:key.toString('base64'), salt:salt});
    });
  });
}

// 회원가입 단방향 암호화
util.pbkdf2AsyncNonSalt = function(crypto, password) {
  return new Promise( (res, rej) => {
    crypto.randomBytes(64, (err, buf) => {
      crypto.pbkdf2(password, buf.toString('base64'), 100000, 64, 'sha512', (err, key) => {
        err ? rej(err) : res({key:key.toString('base64'), salt:buf.toString('base64')});
      });
    });
  });
}

module.exports = util;