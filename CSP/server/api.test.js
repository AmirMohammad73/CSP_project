const { getData } = require('./api');

test('getData should return data', async () => {
  const data = await getData();
  expect(data).toBeDefined();
  expect(Array.isArray(data)).toBe(true);
});