import { request as _request } from 'https';
import { ResponseError, Response429Error, ResponseNotJsonError, RequestError } from '../../errors.ts'

export const call_spotify = async (options: any, body: any | undefined): Promise<any> => {
  return new Promise((resolve, reject) => {
    const request = _request(options, function(response) {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => responseBody = responseBody + chunk);
      response.on('end', function () {
        try {
          let parsedBody = JSON.parse(responseBody + '');
          if (response.statusCode === 429) {
            const retryAfter = parseInt(response.headers['retry-after'] + '')
            if (isNaN(retryAfter)) {
              return reject(new ResponseError(parsedBody.error.status, parsedBody.error.message))
            }
            const minutes = Math.ceil(retryAfter / 60)
            return reject(new Response429Error(minutes, parsedBody.error.status, parsedBody.error.message))
          } else if (typeof(response.statusCode) === 'number' && response.statusCode !== 200 && response.statusCode !== 201) {
            return reject(new ResponseError(parsedBody.error.status, parsedBody.error.message))
          }
          resolve(parsedBody);
        } catch (e) {
          console.error(e)
          throw new ResponseNotJsonError(responseBody)
        }
      });
    });
    request.on('error', err => {
      console.error(err)
      throw new RequestError(err.message)
    });

    if (body !== undefined) {
      request.write(body);
    }
    request.end();
  });
};