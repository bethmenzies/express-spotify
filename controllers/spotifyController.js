var https = require('https');

exports.call_spotify = async (options) => {
  return new Promise((resolve) => {
    const request = https.request(options, function(response) {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => responseBody = responseBody + chunk);
      response.on('end', function () {
        const parsedBody = JSON.parse(responseBody + '');
  
        // Resolve based on status code.
        if (response.statusCode === 200) {
            resolve(parsedBody);
        } else {
            resolve(null)
        }
      });
    });
  
    request.on('error', err => {
      console.error(err)
    });

    request.write("data \n");
    request.end();
  });
};