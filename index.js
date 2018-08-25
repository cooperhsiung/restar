/**
 * Created by Cooper on 2018/08/24.
 */
const http = require('http');
const send = require('./lib/send');
const reply = require('./lib/reply');
const { url: parseUrl, query: parseQuery } = require('./lib/parse');
const noop = () => {};

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
      const urlEntity = parseUrl(req.url);
      req.query = parseQuery(urlEntity.query);
      reply(req, res, async () => {
        const route = this.routes[urlEntity.pathname];
        if (route) {
          let payloads = route[req.method.toLowerCase()] || route['all'];
          if (payloads) {
            try {
              for (let plugin of this.plugins) {
                await plugin(req, res, noop);
              }
              for (let payload of payloads) {
                const outcome = await payload(req, res, noop);
                if (outcome !== undefined && typeof outcome !== 'function') {
                  return send(res, 200, outcome);
                }
              }
            } catch (e) {
              console.error(e);
              send(res, 500, 'Internal Server Error');
            }
          } else {
            send(res, 404, 'Not Support');
          }
        } else {
          send(res, 404, 'Not Found');
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
