/**
 * Created by Cooper on 2018/08/24.
 */
const http = require('http');
const send = require('./lib/send');
const reply = require('./lib/reply');
const parse = require('./lib/parse');
const match = require('./lib/match');
const promis = require('./lib/promis');

const HOOKS = ['use', 'end', 'catch'];
const NAME_ENUM = { use: 'preHandlers', end: 'endHandlers', catch: 'errHandlers' };
const METHODS = ['get', 'post', 'put', 'head', 'delete', 'options', 'all'];

class Restar {
  constructor() {
    this.handlers = { '/': { get: [() => 'Hello Restar!'] } };
    this.preHandlers = { '/': [] };
    this.endHandlers = { '/': [] };
    this.errHandlers = { '/': [] };
  }

  listen(...args) {
    const server = http.createServer(this.fire());
    return server.listen(...args);
  }

  fire() {
    return (req, res) => {
      const urlEntity = parse.url(req.url);
      req.query = parse.query(urlEntity.query);
      req.path = parse.path(urlEntity.pathname);

      const { handlers, preHandlers, endHandlers, buildErrHandlers } = match.call(this, req);

      reply(req, res, async () => {
        try {
          const { next } = await compose(preHandlers);
          if (!next) return;

          const { data } = await compose(handlers);
          if (data !== undefined) {
            await compose(endHandlers);
            return send(res, 200, data);
          }

          send(res, 404, 'Not Found');
        } catch (e) {
          const { data } = await compose(buildErrHandlers(e));
          if (data !== undefined) {
            await compose(endHandlers);
            return send(res, 200, data);
          }

          send(res, 500, 'Internal Server Error');
        }

        async function compose(handlers) {
          for (let handler of handlers) {
            const { next, data } = await promis(handler, req, res);
            if (!next) return { next: false, data };
          }
          return { next: true };
        }
      });
    };
  }
}

HOOKS.forEach(hook => {
  Restar.prototype[hook] = function(path, ...payloads) {
    const proto = NAME_ENUM[hook];
    if (typeof path === 'function') {
      this[proto]['/'] = this[proto]['/'].concat(path).concat(payloads);
    } else if (!path.startsWith('/')) {
      throw new Error('path should start with /');
    } else {
      this[proto][path] = (this[proto][path] || []).concat(payloads);
    }
  };
});

METHODS.forEach(method => {
  Restar.prototype[method] = function(path, ...payloads) {
    if (typeof path !== 'string') throw new TypeError('path should be a string');
    if (!path.startsWith('/')) throw new Error('path should start with /');
    const handler = this.handlers[path];
    if (handler) {
      handler[method] = payloads;
    } else {
      Object.assign(this.handlers, { [path]: { [method]: payloads } });
    }
  };
});

module.exports = Restar;
