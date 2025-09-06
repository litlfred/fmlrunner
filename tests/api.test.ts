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

  describe('FHIR-compliant StructureMap endpoints', () => {
    describe('GET /api/v1/StructureMaps', () => {
      it('should return empty bundle for search', async () => {
        const response = await request(app)
          .get('/api/v1/StructureMaps')
          .expect(200);

        expect(response.body.resourceType).toBe('Bundle');
        expect(response.body.type).toBe('searchset');
        expect(response.body.total).toBe(0);
      });

      it('should accept FHIR search parameters', async () => {
        const response = await request(app)
          .get('/api/v1/StructureMaps?name=test&status=active&_count=10')
          .expect(200);

        expect(response.body.resourceType).toBe('Bundle');
      });
    });

    describe('GET /api/v1/StructureMaps/:id', () => {
      it('should retrieve StructureMap by ID', async () => {
        const response = await request(app)
          .get('/api/v1/StructureMaps/test-structure-map.json')
          .expect(200);

        expect(response.body.resourceType).toBe('StructureMap');
        expect(response.body.name).toBe('TestMap');
      });

      it('should return FHIR OperationOutcome for not found', async () => {
        const response = await request(app)
          .get('/api/v1/StructureMaps/non-existent')
          .expect(404);

        expect(response.body.resourceType).toBe('OperationOutcome');
        expect(response.body.issue[0].severity).toBe('error');
        expect(response.body.issue[0].code).toBe('not-found');
      });
    });

    describe('POST /api/v1/StructureMaps', () => {
      it('should create new StructureMap', async () => {
        const structureMap = {
          resourceType: 'StructureMap',
          name: 'NewMap',
          status: 'draft',
          group: [{
            name: 'main',
            input: [{ name: 'source', mode: 'source' }],
            rule: []
          }]
        };

        const response = await request(app)
          .post('/api/v1/StructureMaps')
          .send(structureMap)
          .expect(201);

        expect(response.body.resourceType).toBe('StructureMap');
        expect(response.body.name).toBe('NewMap');
        expect(response.body.id).toBeDefined();
      });

      it('should return FHIR OperationOutcome for invalid resource', async () => {
        const response = await request(app)
          .post('/api/v1/StructureMaps')
          .send({ resourceType: 'Patient' })
          .expect(400);

        expect(response.body.resourceType).toBe('OperationOutcome');
        expect(response.body.issue[0].code).toBe('invalid');
      });
    });

    describe('PUT /api/v1/StructureMaps/:id', () => {
      it('should update existing StructureMap', async () => {
        const structureMap = {
          resourceType: 'StructureMap',
          name: 'UpdatedMap',
          status: 'active',
          group: [{
            name: 'main',
            input: [{ name: 'source', mode: 'source' }],
            rule: []
          }]
        };

        const response = await request(app)
          .put('/api/v1/StructureMaps/test-id')
          .send(structureMap)
          .expect(200);

        expect(response.body.resourceType).toBe('StructureMap');
        expect(response.body.id).toBe('test-id');
      });
    });

    describe('DELETE /api/v1/StructureMaps/:id', () => {
      it('should delete StructureMap', async () => {
        await request(app)
          .delete('/api/v1/StructureMaps/test-id')
          .expect(204);
      });
    });
  });

  describe('POST /api/v1/StructureMaps/\\$transform', () => {
    it('should transform using FHIR Parameters', async () => {
      const parameters = {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'source',
            resource: { name: 'Jane Doe' }
          },
          {
            name: 'map',
            valueString: 'test-structure-map.json'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/StructureMaps/$transform')
        .send(parameters)
        .expect(200);

      expect(response.body.resourceType).toBe('Parameters');
      expect(response.body.parameter[0].name).toBe('result');
      expect(response.body.parameter[0].resource.fullName).toBe('Jane Doe');
    });

    it('should return OperationOutcome for invalid Parameters', async () => {
      const response = await request(app)
        .post('/api/v1/StructureMaps/$transform')
        .send({ resourceType: 'Bundle' })
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].code).toBe('invalid');
    });

    it('should return OperationOutcome for missing parameters', async () => {
      const parameters = {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'source',
            resource: { name: 'Test' }
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/StructureMaps/$transform')
        .send(parameters)
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].diagnostics).toContain('source" and "map" parameters');
    });

    it('should return OperationOutcome for transformation failure', async () => {
      const parameters = {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'source',
            resource: { name: 'Test' }
          },
          {
            name: 'map',
            valueString: 'non-existent.json'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/StructureMaps/$transform')
        .send(parameters)
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].code).toBe('processing');
    });
  });

  describe('StructureDefinition endpoints', () => {
    describe('GET /api/v1/StructureDefinitions', () => {
      it('should return empty bundle initially', async () => {
        const response = await request(app)
          .get('/api/v1/StructureDefinitions')
          .expect(200);

        expect(response.body.resourceType).toBe('Bundle');
        expect(response.body.type).toBe('searchset');
        expect(response.body.total).toBe(0);
      });
    });

    describe('POST /api/v1/StructureDefinitions', () => {
      it('should create new StructureDefinition', async () => {
        const structureDefinition = {
          resourceType: 'StructureDefinition',
          name: 'TestProfile',
          status: 'draft',
          kind: 'logical',
          type: 'TestResource',
          snapshot: {
            element: [
              {
                path: 'TestResource',
                min: 1,
                max: '1'
              }
            ]
          }
        };

        const response = await request(app)
          .post('/api/v1/StructureDefinitions')
          .send(structureDefinition)
          .expect(201);

        expect(response.body.resourceType).toBe('StructureDefinition');
        expect(response.body.name).toBe('TestProfile');
        expect(response.body.id).toBeDefined();
      });
    });

    describe('GET /api/v1/StructureDefinitions/:id', () => {
      it('should return 404 for non-existent StructureDefinition', async () => {
        const response = await request(app)
          .get('/api/v1/StructureDefinitions/non-existent')
          .expect(404);

        expect(response.body.resourceType).toBe('OperationOutcome');
      });
    });
  });

  describe('Validation endpoints', () => {
    beforeEach(async () => {
      // Register a StructureDefinition for testing
      const structureDefinition = {
        resourceType: 'StructureDefinition',
        url: 'http://example.org/StructureDefinition/TestPatient',
        name: 'TestPatient',
        status: 'active',
        kind: 'resource',
        type: 'Patient',
        snapshot: {
          element: [
            {
              path: 'Patient',
              min: 1,
              max: '1'
            },
            {
              path: 'Patient.name',
              min: 1,
              max: '*',
              type: [{ code: 'string' }]
            }
          ]
        }
      };

      await request(app)
        .post('/api/v1/StructureDefinitions')
        .send(structureDefinition);
    });

    describe('POST /api/v1/validate', () => {
      it('should validate valid resource', async () => {
        const requestBody = {
          resource: {
            resourceType: 'Patient',
            name: 'John Doe'
          },
          profile: 'http://example.org/StructureDefinition/TestPatient'
        };

        const response = await request(app)
          .post('/api/v1/validate')
          .send(requestBody)
          .expect(200);

        expect(response.body.resourceType).toBe('OperationOutcome');
        expect(response.body.issue).toBeDefined();
      });

      it('should return validation errors for invalid resource', async () => {
        const requestBody = {
          resource: {
            resourceType: 'Patient'
            // Missing required name field
          },
          profile: 'http://example.org/StructureDefinition/TestPatient'
        };

        const response = await request(app)
          .post('/api/v1/validate')
          .send(requestBody)
          .expect(400);

        expect(response.body.resourceType).toBe('OperationOutcome');
        expect(response.body.issue.length).toBeGreaterThan(0);
        expect(response.body.issue[0].severity).toBe('error');
      });

      it('should return 400 for missing parameters', async () => {
        const response = await request(app)
          .post('/api/v1/validate')
          .send({ resource: {} })
          .expect(400);

        expect(response.body.resourceType).toBe('OperationOutcome');
        expect(response.body.issue[0].diagnostics).toContain('resource and profile are required');
      });
    });

    describe('POST /api/v1/execute-with-validation', () => {
      it('should execute with validation (basic test)', async () => {
        const requestBody = {
          structureMapReference: 'test-structure-map.json',
          inputContent: { name: 'John Doe' },
          options: {
            strictMode: false
          }
        };

        const response = await request(app)
          .post('/api/v1/execute-with-validation')
          .send(requestBody)
          .expect(200);

        expect(response.body.result).toBeDefined();
      });
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