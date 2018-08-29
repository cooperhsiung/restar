# Restar

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Node Version][node-image]][node-url]

Web framework for rest api, async/await supported, simplistic with zero dependencies.

## Installation

```bash
npm i restar -S
```

## Examples

Looking for usage and examples

https://github.com/cooperhsiung/restar-examples

## Usage

```javascript
const Restar = require('restar');
let app = new Restar();

// use a global plugin
app.use((req, res) => {
  res.setHeader('X-Powered-By', 'Restar');
});

// equal to res.json({ name: 'restar' })
app.get('/test', () => ({ name: 'restar' }));

// you can retrieve params by deconstructing
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

handler(req?:IncomingMessage,res?:IncomingMessage) : void|any

```javascript
app.get('/sleep', async () => {
  await sleep();
  return 'sleep 1s';
});

function sleep(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
```

## Plugin

Like express middleware

```
const serveStatic = require('serve-static');
app.use(serveStatic(path.join(__dirname, 'public')));
```

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
