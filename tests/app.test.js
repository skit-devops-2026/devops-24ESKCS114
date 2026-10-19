const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../server/server');

test('health endpoint returns online status', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'online');
    assert.equal(body.appName, 'MovForYou');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

test('React app is served at the root and existing page URLs', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;

    for (const route of ['/', '/index.html', '/movies.html', '/movie-details.html?id=movie-1']) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`, {
        headers: { Accept: 'text/html' },
      });
      const body = await response.text();

      assert.equal(response.status, 200, `${route} should load`);
      assert.match(body, /<div id="root"><\/div>/, `${route} should load the React entry point`);
    }
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});

test('unknown API routes remain JSON 404 responses', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/not-a-route`, {
      headers: { Accept: 'text/html' },
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.success, false);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});
