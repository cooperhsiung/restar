/**
 * Created by Cooper on 2018/08/24.
 */
const http = require('http');
const send = require('./lib/send');
const reply = require('./lib/reply');
const parse = require('./lib/parse');

class Restar {
  constructor() {
    this.routes = {};
    this.plugins = [];
  }

  listen(...args) {
    const server = http.createServer(this.fire());
    return server.listen(...args);
  }

  use(plugin) {
    if (typeof plugin !== 'function') {
      throw new TypeError('plugin should be type of function');
    }
    this.plugins.push(plugin);
  }

  fire() {
    this.routes['/'] = this.routes['/'] || { get: [() => 'Hello Restar!'] };

    return (req, res) => {
      const urlEntity = parse.url(req.url);
      req.query = parse.query(urlEntity.query);

      reply(req, res, async () => {
        try {
          for (let plugin of this.plugins) {
            const outcome = await promisify(plugin);
            if (outcome !== undefined) {
              return;
            }
          }

          const route = this.routes[urlEntity.pathname];
          if (route) {
            let payloads = route[req.method.toLowerCase()] || route['all'];
            if (payloads) {
              for (let payload of payloads) {
                const outcome = await promisify(payload);
                if (outcome !== undefined) {
                  send(res, 200, outcome);
                  return;
                }
              }
            } else {
              send(res, 404, 'Not Support');
            }
          } else {
            send(res, 404, 'Not Found');
          }
        } catch (e) {
          console.error(e);
          send(res, 500, 'Internal Server Error');
        }
      });

      function promisify(handler) {
        if (handler.length < 3) {
          return handler(req, res);
        } else {
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
        }
      }
    };
  }
}

/*
*
* @route { path { method { payloads } } }
*
* */

['get', 'post', 'put', 'head', 'delete', 'options', 'all'].forEach(method => {
  Restar.prototype[method] = function(path, ...payloads) {
    if (typeof path !== 'string') {
      throw new TypeError('path should be type of string');
    }
    if (!path.startsWith('/')) {
      throw new Error('path should start with /');
    }
    let route = this.routes[path];
    if (route) {
      route[method] = payloads;
    } else {
      Object.assign(this.routes, { [path]: { [method]: payloads } });
    }
  };
});

module.exports = Restar;
