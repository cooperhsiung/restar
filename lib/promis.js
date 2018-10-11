/**
 * Created by Cooper on 2018/10/11.
 */

module.exports = function(handler, req, res) {
  if (handler.length < 3) {
    return handler(req, res);
  }
  return new Promise((resolve, reject) => {
    handler(req, res, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
    res.on('finish', () => {
      resolve(!undefined);
    });
  });
};
