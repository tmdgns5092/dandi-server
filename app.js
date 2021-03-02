const express           = require('express');
const app               = express();
const bodyParser        = require('body-parser');
const http              = require('http').Server(app);
const cookieParser      = require('cookie-parser');
const path              = require('path');
const winston           = require('./config/config-winston')
const morgan            = require("morgan");
const cors              = require('cors');
const PORT              = 3000;

const noticeRouter      = require('./routes/notice');
const forumRouter       = require('./routes/forum');
const requestRouter     = require('./routes/request');
const authRouter        = require('./routes/auth');
const vipRouter         = require('./routes/vip');
const memberRouter      = require('./routes/member');
const attenRouter       = require('./routes/atten_com');
const pitchingRouter    = require('./routes/pitching');
const messageRouter     = require('./routes/message');
const questionRouter    = require('./routes/question');

global.__basedir = __dirname;
//~
// Logging
app.use(morgan('combined', {stream: winston.stream})); // morgan http 로그 미들웨어 추가


app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
  next();
});
app.use(cors());
// Middlewares
app.use(bodyParser());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//http.all('/*', function(req, res, next) {
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
//  next();
//});

// API Router
app.use('/notice',    noticeRouter);
app.use('/forum',     forumRouter);
app.use('/request',   requestRouter);
app.use('/auth',      authRouter);
app.use('/vip',       vipRouter);
app.use('/member',    memberRouter);
app.use('/atten',     attenRouter);
app.use('/pitching',  pitchingRouter);
app.use('/message',   messageRouter);
app.use('/question',  questionRouter);

// catch 404 and forward to error handler!
app.use((req, res, next) => { res.status(404).send({error: 'Not found'}); });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(">>>> ERROR handler ...");
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).send({ error: err })
});

// Server
http.listen(PORT, () => {console.log(`listening on * ${PORT}`);});
// http.listen(3000, () => winston.info(`Listening on port 3000...`));
