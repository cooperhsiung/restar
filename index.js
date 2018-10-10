/**
 * Created by Cooper on 2018/08/24.
 */
const http = require('http');
const send = require('./lib/send');
const reply = require('./lib/reply');
const parse = require('./lib/parse');

class Restar {
  constructor() {
    this.handlers = { '/': { get: [() => 'Hello Restar!'] } };
    this.plugins = { '/': [] };
    this.plugends = { '/': [] };
    this.errHdlers = {};
  }

  listen(...args) {
    const server = http.createServer(this.fire());
    return server.listen(...args);
  }

  catch(path, errHdlers) {
    if (typeof path === 'function') {
      this.errHdlers['/'] = path;
    } else if (!path.startsWith('/')) {
      throw new Error('path should start with /');
    } else {
      Object.assign(this.errHdlers, { [path]: errHdlers });
    }
  }

  use(path, ...plugins) {
    if (typeof path === 'function') {
      this.plugins['/'] = this.plugins['/'].concat(path);
    } else if (!path.startsWith('/')) {
      throw new Error('path should start with /');
    } else {
      this.plugins[path] = (this.plugins[path] || []).concat(plugins);
    }
  }

  end(path, ...plugends) {
    if (typeof path === 'function') {
      this.plugends['/'] = this.plugends['/'].concat(path);
    } else if (!path.startsWith('/')) {
      throw new Error('path should start with /');
    } else {
      this.plugends[path] = (this.plugends[path] || []).concat(plugends);
    }
  }

  fire() {
    return (req, res) => {
      // console.log('========= req.url', req.url);
      const urlEntity = parse.url(req.url);
      req.query = parse.query(urlEntity.query);
      req.path = parse.path(urlEntity.pathname);

      let plugins = this.plugins['/'];
      let plugends = this.plugends['/'];
      let errHdler = this.errHdlers['/'];

      req.path
        .split('/')
        .filter(e => e)
        .reduce((s, e) => {
          s += '/' + e;
          plugins = plugins.concat(this.plugins[s] || []);
          plugends = plugends.concat(this.plugends[s] || []);
          if (this.errHdlers[s]) {
            errHdler = this.errHdlers[s];
          }
          return s;
        }, '');

      reply(req, res, async () => {
        try {
          for (let plugin of plugins) {
            const outcome = await promisify(plugin);
            if (outcome !== undefined) {
              return;
            }
          }

          const handler = this.handlers[req.path];
          if (handler) {
            let payloads = handler[req.method.toLowerCase()] || handler['all'];
            if (payloads) {
              for (let payload of payloads) {
                const outcome = await promisify(payload);

                for (let plugend of plugends) {
                  const outcome = await promisify(plugend);
                  if (outcome !== undefined) {
                    return;
                  }
                }

                if (outcome !== undefined) {
                  send(res, 200, outcome);
                  return;
                }
              }
            } else {
              send(res, 404, 'Unsupported');
            }
          } else {
            send(res, 404, 'Not Found');
          }
        } catch (e) {
          // console.error(e);
          if (errHdler) {
            const outcome = await promisify(errHdler(e));
            if (outcome !== undefined) {
              send(res, 200, outcome);
              return;
            }
          }
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
* @handler { path { method { payloads } } }
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
    let handler = this.handlers[path];
    if (handler) {
      handler[method] = payloads;
    } else {
      Object.assign(this.handlers, { [path]: { [method]: payloads } });
    }
  };
});

module.exports = Restar;
