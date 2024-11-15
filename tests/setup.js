// Increase timeout for all tests
jest.setTimeout(10000);

// Silence console logs during tests
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  };
}