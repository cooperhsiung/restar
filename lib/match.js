/**
 * Created by Cooper on 2018/10/11.
 */

module.exports = function(req) {
  let handlers = this.handlers['/'].get;
  let preHandlers = this.preHandlers['/'];
  let endHandlers = this.endHandlers['/'];
  let buildErrHandlers = err => this.errHandlers['/'].map(h => h(err));

  const stacks = req.path.split('/').filter(e => e);
  stacks.reduce((s, e, i) => {
    s += '/' + e;

    if (i === stacks.length - 1) {
      const mounts = this.handlers[s];
      if (mounts) {
        handlers = mounts[req.method.toLowerCase()] || mounts['all'];
      } else {
        handlers = [];
      }
    }

    preHandlers = preHandlers.concat(this.preHandlers[s] || []);
    endHandlers = endHandlers.concat(this.endHandlers[s] || []);
    if (this.errHandlers[s]) {
      buildErrHandlers = err => this.errHandlers[s].map(h => h(err));
    }

    return s;
  }, '');

  return { handlers, preHandlers, endHandlers, buildErrHandlers };
};
