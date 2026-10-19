/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */

var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var querystring = require('querystring');
var https = require('https');

var client_id = process.env.CLIENTID;
var client_secret = process.env.CLIENTSECRET;
var redirect_uri = process.env.CALLBACK;


const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

var stateKey = 'spotify_auth_state';

router.get('/', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  var code = req.query.code || null;
  var post_data = {  
    'code': code,
    'redirect_uri': redirect_uri,
    'grant_type': 'authorization_code'
  }
  const form_data = Object.keys(post_data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(post_data[key])).join('&');

  res.clearCookie(stateKey);

  var options = {
    hostname: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log(`Response status code: ${response.statusCode}`);
      const body = JSON.parse(data);
      if (response.statusCode === 200) {
        process.env.ACCESS_TOKEN = body.access_token;
        process.env.REFRESH_TOKEN = body.refresh_token;
        res.redirect('/');
      } else {
        res.redirect('/login/error');
      }
    });
  })
  request.on('error', (error) => {
    console.log('Error occurred during the request:', error);
    res.redirect('/login/error');
  })
  request.write(form_data)
  request.end()
})

router.get('/refresh_token', function(req, res) {
  var refresh_token = req.query.refresh_token;
  var post_data = {
    'grant_type': 'refresh_token',
    'refresh_token': refresh_token
  }
  const form_data = Object.keys(post_data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(post_data[key])).join('&');


  var options = {
    hostname: 'accounts.spotify.com',
    path: '/api/token',
    headers: { 
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) 
    },
    json: true
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      const body = JSON.parse(data);
      if (res.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        res.send({
          'access_token': access_token,
          'refresh_token': refresh_token
          });
      } else {
        res.redirect('/login/error');
      }
    });
    request.on('error', () => {
      res.redirect('/login/error');
    })
    request.write(form_data)
    request.end()
  })
});

module.exports = router;