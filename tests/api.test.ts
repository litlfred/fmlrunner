import request from 'supertest';
import { FmlRunnerApi } from '../src/api/server';
import { FmlRunner } from '../src';
import * as path from 'path';

describe('FmlRunnerApi', () => {
  let api: FmlRunnerApi;
  let app: any;
  const testDataDir = path.join(__dirname, 'test-data');

  beforeEach(() => {
    const fmlRunner = new FmlRunner({ baseUrl: testDataDir });
    api = new FmlRunnerApi(fmlRunner);
    app = api.getApp();
  });

  describe('POST /api/v1/compile', () => {
    it('should compile valid FML content', async () => {
      const fmlContent = `
        map "http://example.org/StructureMap/test" = "TestMap"
        source -> target
      `;

      const response = await request(app)
        .post('/api/v1/compile')
        .send({ fmlContent })
        .expect(200);

      expect(response.body.resourceType).toBe('StructureMap');
      expect(response.body.name).toBe('TestMap');
    });

    it('should return 400 for missing fmlContent', async () => {
      const response = await request(app)
        .post('/api/v1/compile')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('fmlContent is required');
    });

    it('should return 400 for empty fmlContent', async () => {
      const response = await request(app)
        .post('/api/v1/compile')
        .send({ fmlContent: '' })
        .expect(400);

      expect(response.body.error).toBe('fmlContent is required');
    });
  });

  describe('POST /api/v1/execute', () => {
    it('should execute StructureMap transformation', async () => {
      const requestBody = {
        structureMapReference: 'test-structure-map.json',
        inputContent: { name: 'John Doe' }
      };

      const response = await request(app)
        .post('/api/v1/execute')
        .send(requestBody)
        .expect(200);

      expect(response.body.result).toEqual({ fullName: 'John Doe' });
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .post('/api/v1/execute')
        .send({ structureMapReference: 'test.json' })
        .expect(400);

      expect(response.body.error).toContain('structureMapReference and inputContent are required');
    });

    it('should return 400 for non-existent StructureMap', async () => {
      const requestBody = {
        structureMapReference: 'non-existent.json',
        inputContent: { test: 'data' }
      };

      const response = await request(app)
        .post('/api/v1/execute')
        .send(requestBody)
        .expect(400);

      expect(response.body.error).toBe('StructureMap execution failed');
    });
  });

  describe('GET /api/v1/structuremap/:reference', () => {
    it('should retrieve existing StructureMap', async () => {
      const response = await request(app)
        .get('/api/v1/structuremap/test-structure-map.json')
        .expect(200);

      expect(response.body.resourceType).toBe('StructureMap');
      expect(response.body.name).toBe('TestMap');
    });

    it('should return 404 for non-existent StructureMap', async () => {
      const response = await request(app)
        .get('/api/v1/structuremap/non-existent.json')
        .expect(404);

      expect(response.body.error).toBe('StructureMap not found');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBe('0.1.0');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});