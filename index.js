/**
 * Created by Cooper on 2018/08/24.
 */
const http = require('http');
const send = require('./lib/send');
const reply = require('./lib/reply');
const { url: parseUrl, query: parseQuery } = require('./lib/parse');

class Restar {
  constructor() {
    this.routes = { '/': { get: [() => 'Hello Restar!'] } };
    this.plugins = [];
  }

  listen(...args) {
    const server = http.createServer(this.fire());
    return server.listen(...args);
  }

  use(plugin) {
    this.plugins.push(plugin);
  }

  fire() {
    return (req, res) => {
      let urlEntity = parseUrl(req.url);
      req.query = parseQuery(urlEntity.query);
      let path = urlEntity.pathname;
      reply(req, res, async () => {
        let route = this.routes[path];
        if (route) {
          let payloads = route[req.method.toLowerCase()] || route['all'];
          if (payloads) {
            try {
              for (let plugin of this.plugins) {
                await plugin(req, res);
              }
              for (let payload of payloads) {
                let outcome = await payload(req, res);
                if (outcome !== undefined || typeof outcome !== 'function') {
                  return send(res, outcome);
                }
              }
            } catch (e) {
              console.error(e);
              res.statusCode = 500;
              res.end('Internal Server Error');
            }
          } else {
            res.statusCode = 404;
            res.end('Not Support');
          }
        } else {
          res.statusCode = 404;
          res.end('Not Found');
        }
      });
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
