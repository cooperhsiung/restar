/**
 * Created by Cooper on 2018/10/11.
 */

module.exports = async function(handler, req, res) {
  if (handler.length < 3) {
    const data = await handler(req, res);
    if (data === undefined) {
      return { next: true };
    }
    return { next: false, data };
  }
  return new Promise((resolve, reject) => {
    handler(req, res, err => {
      if (err) {
        return reject(err);
      }
      resolve({ next: true });
    });
    res.on('finish', () => {
      resolve({ next: false });
    });
  });
};
