var https = require('https');

exports.call_spotify = async (options, body) => {
  return new Promise((resolve) => {
    const request = https.request(options, function(response) {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => responseBody = responseBody + chunk);
      response.on('end', function () {
        let parsedBody;
        try { 
          parsedBody = JSON.parse(responseBody + '');
        } catch (err) {
          console.log(err.name);
          parsedBody = responseBody + '';
        }
  
        // Resolve based on status code.
        console.log(response.statusCode);
        if (response.statusCode === 200 || response.statusCode == 201) {
          return resolve(parsedBody);
        } else {
          return resolve(null)
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