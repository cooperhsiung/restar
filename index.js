/**
 * Created by Cooper on 2018/08/24.
 */
const http = require('http');
const send = require('./lib/send');
const reply = require('./lib/reply');
const parse = require('./lib/parse');
const match = require('./lib/match');
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
      const urlEntity = parse.url(req.url);
      req.query = parse.query(urlEntity.query);
      req.path = parse.path(urlEntity.pathname);

      const { handlers, preHandlers, endHandlers, buildErrHandlers } = match.call(this, req);

      reply(req, res, async () => {
        try {
          if (!(await compose(preHandlers)).next) return;
          const { next } = await dispose(handlers, endHandlers);
          if (next) send(res, 404, 'Not Found');
        } catch (e) {
          // console.log(e);
          const { next } = await dispose(buildErrHandlers(e), endHandlers);
          if (next) send(res, 500, 'Internal Server Error');
        }

        async function dispose(handlers, endHandlers) {
          const { data } = await compose(handlers);
          if (data !== undefined) {
            const { next } = await compose(endHandlers);
            if (next) {
              send(res, 200, data);
              return { data, next: false };
            }
          }
          return { next: true };
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

const path = require('path');
const serveStatic = require('serve-static');

const app = new Restar();

app.use(serveStatic(path.join(__dirname, 'public')));
// app.use('/page', require('./plugins/route-static'), serveStatic(path.join(__dirname, 'public')));
// app.end(express.static(path.join(__dirname, 'public')));

// app.use('/hello', (req, res) => {
//   // return 'hello';
//   return { a: 1 };
// });

app.use(req => {
  req.startAt = Date.now();
});

app.end('/hello', (req, res) => {
  // return 'hello';
  // return { a: 1 };
  console.log(req.startAt);
  console.log(Date.now() - req.startAt);
});

app.use('/user', (req, res) => {
  console.log('mount user');
});

app.use('/user/login', (req, res) => {
  console.log('mount login');
});

app.get('/user/login', (req, res) => {
  throw new Error('err1');

  // return 'login';
});

app.get('/user/register', (req, res) => {
  return 'register';
});

app.get('/test', (req, res) => {
  throw new Error('err1');
  // return 'hello';
});

app.get('/hello', async (req, res) => {
  // return 'hello';
  await sleep(1000);
  return { a: 1 };
});

app.get('/test', (req, res) => {
  throw new Error('err1');
  // return 'hello';
});

function sleep(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

app.catch(e => (req, res) => {
  return 'err catch globle';
});

// app.catch('/user', e => (req, res) => {
//   console.log(e);
//   return 'err catch user';
// });

// app.catch('/user/login',(req, res) => {
//   return 'err catch login';
// });

// console.log(app.plugins);
// console.log(app.errHdlers);
// console.log(app.plugends);
// console.log(app.plugends)
// console.log(app.plugins['/hello'][0].toString())

app.listen(5000);
