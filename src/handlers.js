const queryString = require('querystring');
const https = require('https');
const { client_id, client_secret } = require('../config');
const { getUserDetail } = require('./lib');
const app = require('./app');

const ensureLogin = function (req, res, next) {
  const sessions = req.app.locals.sessions;
  if (sessions[req.cookies.sId] !== undefined) {
    req.user = sessions[req.cookies.sId];
    next();
  }
  req.url = '/signIn.html';
  next();
};

const serveDashboard = function (req, res, next) {
  res.send(`Dash board: ${req.user}`);
};

const publish = function (req, res) {
  console.log(req.body);
  req.app.locals.db.addPost(req.body);
};

const signIn = function (req, res) {
  const params = `client_id=${client_id}&client_secret=${client_secret}`;
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

const githubCallback = function (req, res) {
  const code = req.url.split('=')[1];
  const params = {
    client_id,
    client_secret,
    code,
  };
  const url = {
    hostname: 'github.com',
    path: '/login/oauth/access_token',
    method: 'POST',
  };
  const httpsReq = https.request(url, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      getUserDetail(data);
    });
  });
  httpsReq.end(queryString.stringify(params));
  res.end();
};

module.exports = {
  serveDashboard,
  signIn,
  githubCallback,
  publish,
  ensureLogin,
};
