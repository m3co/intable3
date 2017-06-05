'use strict';
var express = require('express');
var proxy = require('http-proxy-middleware');
var app = express();

app.use('/api', proxy({
  target: 'http://localhost:5554/',
  changeOrigin: true,
  logLevel: 'debug',
  xfwd: true
}));

app.use(/.+/, proxy({
  target: 'http://localhost:8080/',
  xfwd: true
}));

app.listen(5555);
