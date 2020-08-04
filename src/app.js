const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const sqlite = require('sqlite3').verbose();
const Database = require('./database');
const Sessions = require('./session');
const { userRouter } = require('./userRouter');
const {
  serveHomepage,
  signIn,
  githubCallback,
  serveErrorPage,
  getBlog,
  getSessionDetails,
  serveComments,
  serveProfile,
  getFollowers,
  getFollowing,
} = require('./handlers');

const app = express();
const db = new sqlite.Database(`database/${process.env.db}`);

app.locals.sessions = new Sessions({});
app.locals.db = new Database(db);

app.set('view engine', 'pug');
app.set('views', `${__dirname}/../templates`);
app.use(fileUpload());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(getSessionDetails);
app.use('/user', userRouter);

app.get('/', serveHomepage);
app.get('/signIn', signIn);
app.get('/blog/:id', getBlog);
app.get('/callback', githubCallback);
app.get('/comments/:blogId', serveComments);
app.get('/profile/:userId', serveProfile);
app.get('/profile/:id/followers', getFollowers);
app.get('/profile/:id/following', getFollowing);

app.use('/pictures', express.static(`${__dirname}/../database/images`));
app.use(express.static(`${__dirname}/../public`));
app.use(serveErrorPage);

module.exports = app;
