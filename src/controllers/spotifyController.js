var https = require('https');

const call_spotify = async (options, body) => {
  return new Promise((resolve) => {
    const request = https.request(options, function(response) {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => responseBody = responseBody + chunk);
      response.on('end', function () {
        try {
          parsedBody = JSON.parse(responseBody + '');
          return resolve(parsedBody);
        } catch (e) {
          console.error(e)
          return responseBody
        }
      });
    });
  
    request.on('error', err => {
      console.error(err)
    });

    if (body !== undefined) {
      request.write(body);
    }
    request.end();
  });
};

module.exports = { call_spotify }