/**
 * Created by Cooper on 2018/10/10.
 */
module.exports = (req, res) => {
  const tail = req.url.split(req.path)[1];
  if (!tail.includes('/')) {
    res.statusCode = 302;
    res.setHeader('Location', (req.path + '/' + tail).replace('//', '/'));
    res.end();
  } else {
    req.url = req.url.replace(req.path, '');
  }
};
