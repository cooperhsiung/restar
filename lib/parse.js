/**
 * Created by Cooper on 2018/8/25.
 */

exports.query = function(str) {
  if (typeof str === 'string') {
    let j = {};
    try {
      let list = str.split('&').map(e => e.split('='));
      for (const l of list) {
        if (l.length === 2 && !j[l[0]]) {
          j[l[0]] = decodeURIComponent(l[1]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return j;
  } else {
    return {};
  }
};

exports.url = require('url').parse;
