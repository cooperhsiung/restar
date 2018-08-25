/**
 * Created by Cooper on 2018/8/25.
 */
const parseQuery = require('./parse').query;

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
    if (length < 1000) {
      data = data.toString();
      if (type.includes('json')) {
        req.body = JSON.parse(data);
      }
      if (type.includes('form')) {
        req.body = parseQuery(data);
      }
      if (type.includes('plain')) {
        req.body = data;
      }
    }
    req.param = Object.assign({}, req.query, req.body);
    done();
  });
};
