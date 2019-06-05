var express = require('express');
var proxy = require('http-proxy-middleware');

// proxy middleware options
var filter = function (pathname, req) {
  // customize with origin(s) that your content will be served from
  return (req.headers.origin === 'https://www.example.com');
  // multiple origin version:
  // return ((req.headers.origin === 'http://www.example.com') || (req.headers.origin === 'https://www.example.com'));   
};

var apiOptions = {
  target: '', // target host ('https://www.example.com')
  changeOrigin: true, // needed for virtual hosted sites like Heroku
  pathRewrite: {
    '/': '/', // remove endpoint from request path ('^/api/': '/')
  },
  onProxyReq: (proxyReq) => {
    // append key-value pair for API key to end of path
    // using KEYNAME provided by web service
    // and KEYVALUE stored in Heroku environment variable
    proxyReq.path += ('&KEYNAME=' + process.env.KEYVALUE);
  },
  logLevel: 'debug' // verbose server logging
};

// create the proxy (without context)
var apiProxy = proxy(filter, apiOptions);

var app = express();
app.set('port', (process.env.PORT || 5000));

app.use('/api', apiProxy);

app.listen(app.get('port'));
