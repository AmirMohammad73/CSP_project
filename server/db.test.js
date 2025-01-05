const { query } = require('./db');

test('Database query should return rows', async () => {
  const rows = await query('SELECT NOW()');
  expect(rows).toBeDefined();
  expect(rows.length).toBeGreaterThan(0);
});