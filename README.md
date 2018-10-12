# Restar

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Node Version][node-image]][node-url]

Web library for rest api, async/await supported, simplistic with zero dependencies.

## Installation

```bash
npm i restar -S
```

## Benefits

- **respond elegantly**

```javascript
app.get('/hello', () => {
  // return 'hello';
  return { s: 'hello' };
});
```

- **comprehensible middleware**

```javascript
app.use(req => {
  req.startAt = Date.now();
});

app.get('/hello', () => {
  return 'hello';
});

app.end((req, res) => {
  res.setHeader('X-Response-Time', `${Date.now() - req.startAt}ms`);
});

/* only /hello set response time */
// app.end('/hello', (req, res) => {
//   res.setHeader('X-Response-Time', `${Date.now() - req.startAt}ms`);
// });
```

- **error handling elegantly**

```javascript
app.get('/test', () => {
  throw new Error('test err');
});

app.catch(e => (req, res) => {
  return e.message || 'an error';
});

/* catch errors with route*/
// app.catch('/test', e => (req, res) => {
//   return e.message + '2' || 'an error';
// });
```

- **async/await supported**

```javascript
app.get('/sleep', async () => {
  await sleep();
  return 'sleep 1s';
});

function sleep(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
```

- **mount static directory with route**

```javascript
const serveStatic = require('serve-static');
app.use(serveStatic(path.join(__dirname, 'public')));
/*serve static with route*/
// app.use('/doc', routeStatic('/doc'), serveStatic(path.join(__dirname, '../public', 'doc')));

function routeStatic(path) {
  return function(req, res, next) {
    const tail = req.url.split(path)[1];
    if (!tail.includes('/')) {
      res.statusCode = 302;
      res.setHeader('Location', (path + '/' + tail).replace('//', '/'));
      res.end();
    } else {
      req.url = req.url.replace(path, '');
      next();
    }
  };
}
```

## Usage

```javascript
const Restar = require('restar');
let app = new Restar();

// use a global plugin
app.use((req, res) => {
  res.setHeader('X-Powered-By', 'Restar');
});

// equal to res.json({ name: 'restar' }) in express
app.get('/test', () => ({ name: 'restar' }));

// you can retrieve parameters by deconstructing
// (req,res)-({query,body})-({param:assign(query,body)})
app.post('/test', ({ param: { name } }) => {
  return name || null;
});

app.get(
  '/sleep',
  async () => {
    await sleep();
  },
  () => 'sleep 1s'
);

function sleep(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

app.listen(3000);
```

## Async handler

app.`[get|post|put|head|delete|options|all]`(handler1,handler2...)

handler(req?:IncomingMessage,res?:ServerResponse) : void|string|json|Buffer|ReadStream

```javascript
app.get('/sleep', async () => {
  await sleep();
  return 'sleep 1s';
});

function sleep(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
```

## API

### app.use((req,res,next?)=>{})

Like `express` middleware

```javascript
const serveStatic = require('serve-static');
app.use(serveStatic(path.join(__dirname, 'public')));
```

### app.end((req,res,next?)=>{})

Like `express` middleware, execute after route handling

```javascript
app.end((req, res) => {
  res.setHeader('X-Response-Time', `${Date.now() - req.startAt}ms`);
});
```

### app.catch(e=>(req,res,next?)=>{})

Error handling

```javascript
app.catch(e => () => {
  return e.message || 'an error';
});
```

## Examples

Looking for more usages and examples

https://github.com/cooperhsiung/restar-examples

## Caveats

`path-to-regex` is unsupported

- any urls like **http://localhost:3000/user/1** could be converted to **http://localhost:3000/user?id=1**

- when existing massive routes, it will hurt the preformance with `path-to-regex`

In view of the above, in most cases we may not need `path-to-regex` in restful web application

## License

MIT

[npm-image]: https://img.shields.io/npm/v/restar.svg
[npm-url]: https://www.npmjs.com/package/restar
[travis-image]: https://travis-ci.org/cooperhsiung/restar.svg?branch=master
[travis-url]: https://travis-ci.org/cooperhsiung/restar
[travis-url]: https://travis-ci.org/cooperhsiung/restar
[coverage-image]: https://coveralls.io/repos/github/cooperhsiung/restar/badge.svg
[coverage-url]: https://coveralls.io/github/cooperhsiung/restar
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
