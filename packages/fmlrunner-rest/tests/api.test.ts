import { FmlRunnerApi } from '../src/api';

describe('FML Runner REST API', () => {
  test('should create API instance', () => {
    const api = new FmlRunnerApi({});
    expect(api).toBeDefined();
  });
});