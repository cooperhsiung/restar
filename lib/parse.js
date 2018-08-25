/**
 * Created by Cooper on 2018/8/25.
 */

exports.query = function(str) {
  if (typeof str === 'string') {
    let list = str.split('&').map(e => e.split('='));
    let j = {};
    for (const l of list) {
      if (l.length === 2 && !j[l[0]]) {
        j[l[0]] = decodeURIComponent(l[1]);
      }
    }
    return j;
  } else {
    return {};
  }
};

exports.url = require('url').parse;
