# Ajax proxy

A proxy server for redirecting HTTP requests from client-side code using credentials stored on the back end.
Based on [Expressjs](https://expressjs.com) and [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware).

## Configuration

1. Clone (or fork and clone) this repo.
2. Customize index.js for your endpoint:

  - In the `filter` function, specify your app's front end origin as the value for `req.headers.origin`.
```js
  // customize with origin(s) that your content will be served from
  return (req.headers.origin === 'https://www.example.com');
  // multiple origin version:
  // return ((req.headers.origin === 'http://www.example.com') ||
  //         (req.headers.origin === 'https://www.example.com'));
```
  - In the `apiOptions` object, specify the target host URL as the value for `target`.

```js
  var apiOptions = {
    target: '', // target host ('https://www.example.com')
    ...
  };
```

   3. Deploy to Heroku using this button
   
       [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

  > For more information about using Heroku, check out https://devcenter.heroku.com/

   4. On the Heroku Dashboard, in Settings, add a Config Var to store your private credentials for the service you want to access.

   5. In `index.js`, update `apiOptions.onProxyReq` to use the keyname provided by your target host and the name of the config var you created in Heroku to store your credential value.

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

   6. Deploy changes to Heroku.

   7. In the front-end code for your app, rewrite the URL in your ajax request to use your Heroku proxy app as the base URL.

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

```https://<HEROKU-INSTANCE>.herokuapp.com/nps/api/v1/parks?stateCode=ca';```

the proxy rewrites and forwards the request as

```https://developer.nps.gov/api/v1/parks?stateCode=ca&api_key=########```

(where `########` is the secret key stored in the Heroku Config Var with the name `NPS_APIKEY`)

## License

[The MIT License (MIT)](https://choosealicense.com/licenses/mit/)

Copyright (c) 2019 Sasha Vodnik

<!-- 
## Deploying to Heroku

```
heroku create
git push heroku master
heroku open
```
-->