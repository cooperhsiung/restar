/**
 * Created by Cooper on 2018/8/25.
 */
const app = new (require('../'))();
const server = app.listen();
const request = require('supertest').agent(server);

app.get('/sleep', async () => {
  await sleep();
  return 'sleep 1s';
});

function sleep(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

describe('Restar Test', function() {
  after(() => {
    server.close();
  });

  it('should return 200 OK', () => {
    return request.get('/').expect(200);
  });

  it('should return 200 OK', function() {
    this.timeout(1010);
    return request.get('/sleep').expect(200);
  });
});
