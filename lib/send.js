/**
 * Created by Cooper on 2018/8/25.
 */
const { Stream } = require('stream');

module.exports = function(res, code, obj) {
  res.statusCode = code;

  if (Buffer.isBuffer(obj)) {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', obj.length);
    res.end(obj);
    return;
  }

  if (isReadableStream(obj)) {
    res.setHeader('Content-Type', 'application/octet-stream');
    obj.pipe(res);
    return;
  }

  let str = obj;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (typeof obj === 'object' || typeof obj === 'number') {
    str = JSON.stringify(obj);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  res.setHeader('Content-Length', Buffer.byteLength(str));
  res.end(str);
};

function isReadableStream(obj) {
  return obj instanceof Stream && obj.readable;
}
