import { StructureMapExecutor } from '../src/lib/structure-map-executor';
import { StructureMap } from '../src/types';

describe('FHIRPath Integration', () => {
  let executor: StructureMapExecutor;

  beforeEach(() => {
    executor = new StructureMapExecutor();
  });

  test('should use proper FHIRPath evaluation for simple expressions', () => {
    const structureMap: StructureMap = {
      resourceType: 'StructureMap',
      id: 'test-fhirpath',
      name: 'TestFHIRPath',
      url: 'http://example.com/StructureMap/test-fhirpath',
      status: 'draft',
      group: [{
        name: 'main',
        input: [{ name: 'source', mode: 'source' }],
        rule: [{
          name: 'test-evaluate',
          source: [{ element: 'name', context: 'source' }],
          target: [{
            element: 'result',
            transform: 'evaluate',
            parameter: ['first().given.first()']
          }]
        }]
      }]
    };

    const inputData = {
      name: [{
        given: ['John', 'Middle'],
        family: 'Doe'
      }]
    };

    const result = executor.execute(structureMap, inputData);
    
    expect(result.success).toBe(true);
    expect(result.result).toHaveProperty('result');
    expect(result.result.result).toBe('John'); // Should extract first given name
  });

  test('should handle FHIRPath evaluation errors gracefully', () => {
    const structureMap: StructureMap = {
      resourceType: 'StructureMap',
      id: 'test-fhirpath-error',
      name: 'TestFHIRPathError',
      url: 'http://example.com/StructureMap/test-fhirpath-error',
      status: 'draft',
      group: [{
        name: 'main',
        input: [{ name: 'source', mode: 'source' }],
        rule: [{
          name: 'test-evaluate-error',
          source: [{ element: 'data', context: 'source' }],
          target: [{
            element: 'result',
            transform: 'evaluate',
            parameter: ['invalid FHIRPath syntax...']
          }]
        }]
      }]
    };

    const inputData = { data: 'test' };

    const result = executor.execute(structureMap, inputData);
    
    expect(result.success).toBe(true);
    expect(result.result).toHaveProperty('result');
    expect(result.result.result).toBeUndefined(); // Should return undefined for failed evaluations
  });

  test('should work with boolean expressions', () => {
    const structureMap: StructureMap = {
      resourceType: 'StructureMap',
      id: 'test-boolean',
      name: 'TestBoolean',
      url: 'http://example.com/StructureMap/test-boolean',
      status: 'draft',
      group: [{
        name: 'main',
        input: [{ name: 'source', mode: 'source' }],
        rule: [{
          name: 'test-boolean',
          source: [{ element: 'active', context: 'source' }],
          target: [{
            element: 'isActive',
            transform: 'evaluate',
            parameter: ['true']
          }]
        }]
      }]
    };

    const inputData = { active: true };

    const result = executor.execute(structureMap, inputData);
    
    expect(result.success).toBe(true);
    expect(result.result).toHaveProperty('isActive');
    expect(result.result.isActive).toBe(true);
  });
});