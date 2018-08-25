/**
 * Created by Cooper on 2018/8/25.
 */
const expect = require('chai').expect;
const { url: parseUrl, query: parseQuery } = require('../lib/parse');

describe('Parse Test', function() {
  it('parse url', function() {
    const urlEntity = parseUrl('http://example.com:80/test?id=1');
    expect(urlEntity.protocol).to.equal('http:');
    expect(urlEntity.query).to.equal('id=1');
    expect(urlEntity.pathname).to.equal('/test');
  });

  it('parse query', function() {
    const queryEntity = parseQuery('id=1&name=restar');
    expect(queryEntity).to.deep.equal({ id: '1', name: 'restar' });
  });
});
