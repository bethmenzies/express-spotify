var https = require('https');

exports.call_spotify = async (options, body) => {
  return new Promise((resolve) => {
    const request = https.request(options, function(response) {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => responseBody = responseBody + chunk);
      response.on('end', function () {
        const parsedBody = JSON.parse(responseBody + '');
  
        // Resolve based on status code.
        console.log(response.statusCode);
        if (response.statusCode === 200 || response.statusCode == 201) {
            resolve(parsedBody);
        } else {
            resolve(null)
        }
      });
    });
  
    request.on('error', err => {
      console.error(err)
    });

    request.write(body === undefined ? "data \n" : body);
    request.end();
  });
};