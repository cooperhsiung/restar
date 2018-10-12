/**
 * Created by Cooper on 2018/8/25.
 */

exports.query = function(str) {
  if (typeof str === 'string') {
    let j = {};
    let list = str.split('&').map(e => e.split('='));
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

exports.path = function(str) {
  return (
    '/' +
    str
      .split('/')
      .filter(e => e)
      .join('/')
  );
};

exports.bound = function(str) {
  let m;
  let r = {};
  let pat = /name="(.*?)"\s+(.*?)\s+------/g;
  while ((m = pat.exec(str))) {
    r[m[1]] = m[2];
  }
  return r;
};

exports.url = require('url').parse;

exports.json = JSON.parse;
