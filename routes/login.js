var express = require('express');
var router = express.Router();

var crypto = require('crypto');
var https = require('https')

var client_id = process.env.CLIENTID;
var client_secret = process.env.CLIENTSECRET;
var redirect_uri = process.env.CALLBACK;

var stateKey = 'spotify_auth_state';

const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

/** Spotify login.
 * Saves the auth token
 * 
 */
router.get('/', function(req, res, next) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  var url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", client_id);
  url.searchParams.append("scope", scope);
  url.searchParams.append("redirect_uri", redirect_uri);
  url.searchParams.append("state", state);
  res.redirect(url);
});

router.get('/callback', function(req, res, next) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/error');
  } else {
    res.clearCookie(stateKey);
    const body = {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    }

    var requestBody = [];
    for (var property in body) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(body[property]);
      requestBody.push(encodedKey + "=" + encodedValue);
    }
    requestBody = requestBody.join("&");

    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': requestBody.length,
        Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    const request = https.request(options, function(response) {
      response.setEncoding('utf8');
      let responseBody = '';
      console.log(response.statusCode);
      response.on('data', (chunk) => responseBody = responseBody + chunk);
      response.on('end', function () {
        const parsedBody = JSON.parse(responseBody + '');

        // Resolve or reject based on status code.
        if (response.statusCode === 200) {
          process.env.ACCESS_TOKEN = parsedBody.access_token
          process.env.REFRESH_TOKEN = parsedBody.refresh_token
          res.redirect('/')
        } else {
          res.redirect('/login/error')
        }
      });
    });

    request.write(requestBody)
    request.end()
    request.on('error', err => {
      console.error(err)
    })
  }
});

router.get('/error', function(req, res, next) {
  res.send('Login failed')
})

module.exports = router;
