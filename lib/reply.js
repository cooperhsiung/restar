/**
 * Created by Cooper on 2018/8/25.
 */
const parse = require('./parse');

module.exports = function(req, _, done) {
  let data = [];
  const type = req.headers['content-type'] || 'text/plain';

  req.on('data', chunk => {
    data.push(chunk);
  });

  req.on('end', () => {
    data = Buffer.concat(data);
    let length = Buffer.byteLength(data);
    req.data = data;
    // simply infer content type
    if (length < 1000) {
      data = data.toString();
      try {
        if (type.includes('json')) {
          req.body = parse.json(data);
        }
        if (type.includes('form-urlencoded')) {
          req.body = parse.query(data);
        }
        if (type.includes('form-data')) {
          req.body = parse.bound(data);
        }
        if (type.includes('plain')) {
          req.body = data;
        }
      } catch (e) {
        console.error(e);
      }
    }
    req.param = Object.assign({}, req.query, typeof req.body === 'object' ? req.body : {});
    done();
  });
};
