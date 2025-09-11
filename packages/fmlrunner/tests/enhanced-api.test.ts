import request from 'supertest';
import { FmlRunnerApi } from '../src/api/server';
import { FmlRunner } from '../src/index';

describe('Enhanced FHIR Resource API Tests', () => {
  let app: any;
  let fmlRunner: FmlRunner;

  beforeEach(() => {
    fmlRunner = new FmlRunner();
    const api = new FmlRunnerApi(fmlRunner);
    app = api.getApp();
  });

  describe('Bundle Processing', () => {
    describe('POST /api/v1/Bundle', () => {
      it('should process a bundle with multiple resource types', async () => {
        const bundle = {
          resourceType: 'Bundle',
          type: 'collection',
          entry: [
            {
              resource: {
                resourceType: 'ConceptMap',
                id: 'test-cm',
                url: 'http://example.org/ConceptMap/test',
                status: 'active',
                sourceUri: 'http://example.org/vs1',
                targetUri: 'http://example.org/vs2',
                group: [{
                  source: 'http://example.org/cs1',
                  target: 'http://example.org/cs2',
                  element: [{
                    code: 'A',
                    target: [{
                      code: 'B',
                      equivalence: 'equivalent'
                    }]
                  }]
                }]
              }
            },
            {
              resource: {
                resourceType: 'ValueSet',
                id: 'test-vs',
                url: 'http://example.org/ValueSet/test',
                status: 'active',
                compose: {
                  include: [{
                    system: 'http://example.org/cs1',
                    concept: [
                      { code: 'A', display: 'Alpha' },
                      { code: 'B', display: 'Beta' }
                    ]
                  }]
                }
              }
            },
            {
              resource: {
                resourceType: 'CodeSystem',
                id: 'test-cs',
                url: 'http://example.org/CodeSystem/test',
                status: 'active',
                content: 'complete',
                concept: [
                  { code: 'A', display: 'Alpha' },
                  { code: 'B', display: 'Beta' }
                ]
              }
            }
          ]
        };

        const response = await request(app)
          .post('/api/v1/Bundle')
          .send(bundle)
          .expect(201);

        expect(response.body.resourceType).toBe('OperationOutcome');
        expect(response.body.issue[0].severity).toBe('information');
        expect(response.body.issue[0].diagnostics).toContain('1 ConceptMaps');
        expect(response.body.issue[0].diagnostics).toContain('1 ValueSets');
        expect(response.body.issue[0].diagnostics).toContain('1 CodeSystems');
      });

      it('should return error for invalid bundle', async () => {
        const response = await request(app)
          .post('/api/v1/Bundle')
          .send({ invalid: 'data' })
          .expect(400);

        expect(response.body.resourceType).toBe('OperationOutcome');
        expect(response.body.issue[0].code).toBe('invalid');
      });
    });

    describe('GET /api/v1/Bundle/summary', () => {
      it('should return summary of loaded resources', async () => {
        const response = await request(app)
          .get('/api/v1/Bundle/summary')
          .expect(200);

        expect(response.body.resourceType).toBe('Bundle');
        expect(response.body.type).toBe('collection');
      });
    });
  });

  describe('ConceptMap CRUD Operations', () => {
    const testConceptMap = {
      resourceType: 'ConceptMap',
      name: 'TestConceptMap',
      status: 'active',
      sourceUri: 'http://example.org/vs1',
      targetUri: 'http://example.org/vs2',
      group: [{
        source: 'http://example.org/cs1',
        target: 'http://example.org/cs2',
        element: [{
          code: 'A',
          target: [{
            code: 'B',
            equivalence: 'equivalent'
          }]
        }]
      }]
    };

    describe('POST /api/v1/ConceptMap', () => {
      it('should create a new ConceptMap', async () => {
        const response = await request(app)
          .post('/api/v1/ConceptMap')
          .send(testConceptMap)
          .expect(201);

        expect(response.body.resourceType).toBe('ConceptMap');
        expect(response.body.name).toBe('TestConceptMap');
        expect(response.body.id).toBeDefined();
      });

      it('should reject invalid ConceptMap', async () => {
        const response = await request(app)
          .post('/api/v1/ConceptMap')
          .send({ resourceType: 'Invalid' })
          .expect(400);

        expect(response.body.resourceType).toBe('OperationOutcome');
      });
    });

    describe('GET /api/v1/ConceptMap', () => {
      it('should search ConceptMaps', async () => {
        const response = await request(app)
          .get('/api/v1/ConceptMap')
          .expect(200);

        expect(response.body.resourceType).toBe('Bundle');
        expect(response.body.type).toBe('searchset');
      });
    });

    describe('POST /api/v1/ConceptMap/$translate', () => {
      it('should translate codes using loaded ConceptMaps', async () => {
        // First, create a ConceptMap
        await request(app)
          .post('/api/v1/ConceptMap')
          .send(testConceptMap)
          .expect(201);

        const parameters = {
          resourceType: 'Parameters',
          parameter: [
            { name: 'system', valueUri: 'http://example.org/cs1' },
            { name: 'code', valueCode: 'A' },
            { name: 'target', valueUri: 'http://example.org/cs2' }
          ]
        };

        const response = await request(app)
          .post('/api/v1/ConceptMap/$translate')
          .send(parameters)
          .expect(200);

        expect(response.body.resourceType).toBe('Parameters');
        expect(response.body.parameter).toBeDefined();
      });
    });
  });

  describe('ValueSet CRUD Operations', () => {
    const testValueSet = {
      resourceType: 'ValueSet',
      name: 'TestValueSet',
      status: 'active',
      compose: {
        include: [{
          system: 'http://example.org/cs1',
          concept: [
            { code: 'A', display: 'Alpha' },
            { code: 'B', display: 'Beta' }
          ]
        }]
      }
    };

    describe('POST /api/v1/ValueSet', () => {
      it('should create a new ValueSet', async () => {
        const response = await request(app)
          .post('/api/v1/ValueSet')
          .send(testValueSet)
          .expect(201);

        expect(response.body.resourceType).toBe('ValueSet');
        expect(response.body.name).toBe('TestValueSet');
        expect(response.body.id).toBeDefined();
      });
    });

    describe('GET /api/v1/ValueSet', () => {
      it('should search ValueSets', async () => {
        const response = await request(app)
          .get('/api/v1/ValueSet')
          .expect(200);

        expect(response.body.resourceType).toBe('Bundle');
        expect(response.body.type).toBe('searchset');
      });
    });

    describe('POST /api/v1/ValueSet/$expand', () => {
      it('should expand ValueSet', async () => {
        // First, create a ValueSet
        const createResponse = await request(app)
          .post('/api/v1/ValueSet')
          .send(testValueSet)
          .expect(201);

        const valueSetId = createResponse.body.id;

        const response = await request(app)
          .post(`/api/v1/ValueSet/${valueSetId}/$expand`)
          .send({ resourceType: 'Parameters', parameter: [] })
          .expect(200);

        expect(response.body.resourceType).toBe('ValueSet');
        expect(response.body.expansion).toBeDefined();
      });
    });

    describe('POST /api/v1/ValueSet/$validate-code', () => {
      it('should validate code in ValueSet', async () => {
        // First, create a ValueSet
        const createResponse = await request(app)
          .post('/api/v1/ValueSet')
          .send(testValueSet)
          .expect(201);

        const valueSetId = createResponse.body.id;

        const parameters = {
          resourceType: 'Parameters',
          parameter: [
            { name: 'system', valueUri: 'http://example.org/cs1' },
            { name: 'code', valueCode: 'A' }
          ]
        };

        const response = await request(app)
          .post(`/api/v1/ValueSet/${valueSetId}/$validate-code`)
          .send(parameters)
          .expect(200);

        expect(response.body.resourceType).toBe('Parameters');
        expect(response.body.parameter).toBeDefined();
        expect(response.body.parameter.find((p: any) => p.name === 'result')?.valueBoolean).toBe(true);
      });
    });
  });

  describe('CodeSystem CRUD Operations', () => {
    const testCodeSystem = {
      resourceType: 'CodeSystem',
      name: 'TestCodeSystem',
      status: 'active',
      content: 'complete',
      concept: [
        { code: 'A', display: 'Alpha', definition: 'First letter' },
        { code: 'B', display: 'Beta', definition: 'Second letter' }
      ]
    };

    describe('POST /api/v1/CodeSystem', () => {
      it('should create a new CodeSystem', async () => {
        const response = await request(app)
          .post('/api/v1/CodeSystem')
          .send(testCodeSystem)
          .expect(201);

        expect(response.body.resourceType).toBe('CodeSystem');
        expect(response.body.name).toBe('TestCodeSystem');
        expect(response.body.id).toBeDefined();
      });
    });

    describe('GET /api/v1/CodeSystem', () => {
      it('should search CodeSystems', async () => {
        const response = await request(app)
          .get('/api/v1/CodeSystem')
          .expect(200);

        expect(response.body.resourceType).toBe('Bundle');
        expect(response.body.type).toBe('searchset');
      });
    });

    describe('POST /api/v1/CodeSystem/$lookup', () => {
      it('should lookup concept in CodeSystem', async () => {
        // First, create a CodeSystem
        const createResponse = await request(app)
          .post('/api/v1/CodeSystem')
          .send(testCodeSystem)
          .expect(201);

        const codeSystemId = createResponse.body.id;

        const parameters = {
          resourceType: 'Parameters',
          parameter: [
            { name: 'code', valueCode: 'A' }
          ]
        };

        const response = await request(app)
          .post(`/api/v1/CodeSystem/${codeSystemId}/$lookup`)
          .send(parameters)
          .expect(200);

        expect(response.body.resourceType).toBe('Parameters');
        expect(response.body.parameter).toBeDefined();
        expect(response.body.parameter.find((p: any) => p.name === 'display')?.valueString).toBe('Alpha');
      });
    });

    describe('POST /api/v1/CodeSystem/$validate-code', () => {
      it('should validate code in CodeSystem', async () => {
        // First, create a CodeSystem
        const createResponse = await request(app)
          .post('/api/v1/CodeSystem')
          .send(testCodeSystem)
          .expect(201);

        const codeSystemId = createResponse.body.id;

        const parameters = {
          resourceType: 'Parameters',
          parameter: [
            { name: 'code', valueCode: 'A' }
          ]
        };

        const response = await request(app)
          .post(`/api/v1/CodeSystem/${codeSystemId}/$validate-code`)
          .send(parameters)
          .expect(200);

        expect(response.body.resourceType).toBe('Parameters');
        expect(response.body.parameter).toBeDefined();
        expect(response.body.parameter.find((p: any) => p.name === 'result')?.valueBoolean).toBe(true);
      });
    });

    describe('POST /api/v1/CodeSystem/$subsumes', () => {
      it('should test subsumption between codes', async () => {
        // First, create a CodeSystem
        const createResponse = await request(app)
          .post('/api/v1/CodeSystem')
          .send(testCodeSystem)
          .expect(201);

        const codeSystemId = createResponse.body.id;

        const parameters = {
          resourceType: 'Parameters',
          parameter: [
            { name: 'codeA', valueCode: 'A' },
            { name: 'codeB', valueCode: 'B' }
          ]
        };

        const response = await request(app)
          .post(`/api/v1/CodeSystem/${codeSystemId}/$subsumes`)
          .send(parameters)
          .expect(200);

        expect(response.body.resourceType).toBe('Parameters');
        expect(response.body.parameter).toBeDefined();
        expect(response.body.parameter.find((p: any) => p.name === 'outcome')?.valueCode).toBeDefined();
      });
    });
  });

  describe('Library API Integration', () => {
    it('should allow direct library access to all resource types', () => {
      // Test ConceptMap methods
      const conceptMap = {
        resourceType: 'ConceptMap' as const,
        id: 'test-cm',
        status: 'active' as const
      };
      fmlRunner.registerConceptMap(conceptMap);
      expect(fmlRunner.getConceptMap('test-cm')).toEqual(conceptMap);
      expect(fmlRunner.getAllConceptMaps()).toContain(conceptMap);

      // Test ValueSet methods
      const valueSet = {
        resourceType: 'ValueSet' as const,
        id: 'test-vs',
        status: 'active' as const
      };
      fmlRunner.registerValueSet(valueSet);
      expect(fmlRunner.getValueSet('test-vs')).toEqual(valueSet);
      expect(fmlRunner.getAllValueSets()).toContain(valueSet);

      // Test CodeSystem methods
      const codeSystem = {
        resourceType: 'CodeSystem' as const,
        id: 'test-cs',
        status: 'active' as const,
        content: 'complete' as const
      };
      fmlRunner.registerCodeSystem(codeSystem);
      expect(fmlRunner.getCodeSystem('test-cs')).toEqual(codeSystem);
      expect(fmlRunner.getAllCodeSystems()).toContain(codeSystem);

      // Test Bundle processing
      const bundle = {
        resourceType: 'Bundle' as const,
        type: 'collection' as const,
        entry: [
          { resource: conceptMap },
          { resource: valueSet },
          { resource: codeSystem }
        ]
      };
      const result = fmlRunner.processBundle(bundle);
      expect(result.success).toBe(true);
      expect(result.processed.conceptMaps).toBe(1);
      expect(result.processed.valueSets).toBe(1);
      expect(result.processed.codeSystems).toBe(1);
    });
  });
});