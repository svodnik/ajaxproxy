# Ajax proxy

A proxy server for redirecting HTTP requests from client-side code using credentials stored on the back end.

Based on [Expressjs](https://expressjs.com) and [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware).

Configuration instructions include steps for deploying to Heroku, but proxy can be deployed to any Node environment.

## Configuration

1. Clone this repo to your local machine.
2. [Create a new app on Heroku](https://dashboard.heroku.com/apps).
3. Store your API credentials using config vars.
  - On the Heroku dashboard for your app, click Settings, then click Reveal Config Vars.
  - Enter a name for the config var, paste your API key or other credential as the value, then click Add.

4. Customize index.js for your endpoint:

  - In the `filter` function, specify your app's front end origin as the value for `req.headers.origin`.
```js
  // replace www.myapp.example with origin(s) that your content will be served from
  return (req.headers.origin === 'https://www.myapp.example');
  // multiple origin version:
  // return ((req.headers.origin === 'http://myapp.example') ||
  //         (req.headers.origin === 'https://www.myapp.example'));
```
  - In the `apiOptions` object, specify the URL of the web service you're connecting to as the value for `target`.

```js
  var apiOptions = {
    // replace api.datasource.example with the url of your target host
    target: 'https://api.datasource.example',
    ...
    };
```

  - In the `apiOptions` object, update `onProxyReq` to use the keyname provided by your target host and the name of the config var you created in Heroku to store your credential value.

```js
  var apiOptions = {
    ...
    onProxyReq: (proxyReq) => {
      // append key-value pair for API key to end of path
      // using KEYNAME provided by web service
      // and KEYVALUE stored in Heroku config var
      proxyReq.path += ('&KEYNAME=' + process.env.KEYVALUE);
    },
    logLevel: 'debug' // verbose server logging
  }; 
```

   5. In your browser, return to your Heroku Dashboard, click Deploy, then follow the steps to deploy your customized code from your local machine to Heroku.

   6. In the front-end code for your app, rewrite the URL in your ajax request to use your Heroku proxy app as the base URL.

## Example
The following code uses the U.S. [National Park Service API]().

```js
var express = require('express');
var proxy = require('http-proxy-middleware');

var filter = function (pathname, req) {
  return ((req.headers.origin === 'http://127.0.0.1:5500') ||
          (req.headers.origin === 'https://127.0.0.1:5500'));
};

var npsOptions = {
  target: 'https://developer.nps.gov', 
  changeOrigin: true, 
  pathRewrite: {
    '^/nps/': '/', 
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.path += ('&api_key=' + process.env.NPS_APIKEY);
  },
  logLevel: 'debug'
};

var npsProxy = proxy(filter, npsOptions);

var app = express();
app.set('port', (process.env.PORT || 5000));

app.use('/nps', npsProxy);

app.listen(app.get('port'));

```

Starting with a front-end request like

```http
https://<HEROKU-INSTANCE>.herokuapp.com/nps/api/v1/parks?stateCode=ca
```

the proxy rewrites and forwards the request as

```http
https://developer.nps.gov/api/v1/parks?stateCode=ca&api_key=########
```

(where `########` is the secret key stored in the Heroku Config Var with the name `NPS_APIKEY`)

## License

[The MIT License (MIT)](https://choosealicense.com/licenses/mit/)

Copyright (c) 2019 Sasha Vodnik
