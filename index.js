/**
 * Created by Cooper on 2018/08/24.
 */
const http = require('http');
const send = require('./lib/send');
const reply = require('./lib/reply');
const parse = require('./lib/parse');
const promis = require('./lib/promis');

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
      let handlers = this.handlers['/'].get;
      let preHandlers = this.preHandlers['/'];
      let endHandlers = this.endHandlers['/'];
      let errHandlers = this.errHandlers['/'];

      const urlEntity = parse.url(req.url);
      req.query = parse.query(urlEntity.query);
      req.path = parse.path(urlEntity.pathname);

      const stacks = req.path.split('/').filter(e => e);
      stacks.reduce((s, e, i) => {
        s += '/' + e;
        preHandlers = preHandlers.concat(this.preHandlers[s] || []);
        endHandlers = endHandlers.concat(this.endHandlers[s] || []);
        if (this.errHandlers[s]) {
          errHandlers = this.errHandlers[s];
        }

        if (i === stacks.length - 1) {
          const mounts = this.handlers[s];
          if (mounts) {
            handlers = mounts[req.method.toLowerCase()] || mounts['all'];
          } else {
            handlers = [];
          }
        }
        return s;
      }, '');

      reply(req, res, async () => {
        try {
          const { next: _next } = await compose(preHandlers);
          if (!_next) return;
          const { next } = await dispose(handlers, endHandlers);
          if (next) send(res, 404, 'Not Found');
        } catch (e) {
          const { next } = await dispose(errHandlers, endHandlers);
          if (next) send(res, 500, 'Internal Server Error');
        }

        async function dispose(handlers, endHandlers) {
          const { result } = await compose(handlers);
          if (result !== undefined) {
            const { next } = await compose(endHandlers);
            if (next) {
              send(res, 200, result);
              return { next: false, result };
            }
          }
          return { next: true };
        }

        async function compose(handlers) {
          for (let handler of handlers) {
            const result = await promis(handler, req, res);
            if (result !== undefined) {
              return { next: false, result }; // !next
            }
          }
          return { next: true }; // next
        }
      });
    };
  }
}

const nameEnum = { use: 'preHandlers', end: 'endHandlers', catch: 'errHandlers' };

['use', 'end', 'catch'].forEach(hook => {
  Restar.prototype[hook] = function(path, ...payloads) {
    const proto = nameEnum[hook];
    if (typeof path === 'function') {
      this[proto]['/'] = this[proto]['/'].concat(path).concat(payloads);
    } else if (!path.startsWith('/')) {
      throw new Error('path should start with /');
    } else {
      this[proto][path] = (this[proto][path] || []).concat(payloads);
    }
  };
});

['get', 'post', 'put', 'head', 'delete', 'options', 'all'].forEach(method => {
  Restar.prototype[method] = function(path, ...payloads) {
    if (typeof path !== 'string') {
      throw new TypeError('path should be type of string');
    }
    if (!path.startsWith('/')) {
      throw new Error('path should start with /');
    }
    const handler = this.handlers[path];
    if (handler) {
      handler[method] = payloads;
    } else {
      Object.assign(this.handlers, { [path]: { [method]: payloads } });
    }
  };
});

module.exports = Restar;
