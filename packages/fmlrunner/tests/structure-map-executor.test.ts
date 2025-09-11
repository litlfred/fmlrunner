import { StructureMapExecutor } from '../src/lib/structure-map-executor';
import { StructureMap } from '../src/types';

describe('StructureMapExecutor', () => {
  let executor: StructureMapExecutor;

  beforeEach(() => {
    executor = new StructureMapExecutor();
  });

  const testStructureMap: StructureMap = {
    resourceType: 'StructureMap',
    name: 'TestMap',
    status: 'active',
    group: [
      {
        name: 'main',
        input: [
          { name: 'source', mode: 'source' },
          { name: 'target', mode: 'target' }
        ],
        rule: [
          {
            source: [{ context: 'source', element: 'name' }],
            target: [{ context: 'target', element: 'fullName' }]
          }
        ]
      }
    ]
  };

  describe('execute', () => {
    it('should execute basic StructureMap transformation', () => {
      const inputData = { name: 'John Doe' };
      const result = executor.execute(testStructureMap, inputData);

      expect(result.success).toBe(true);
      expect(result.result).toEqual({ fullName: 'John Doe' });
    });

    it('should return error for null StructureMap', () => {
      const result = executor.execute(null as any, {});

      expect(result.success).toBe(false);
      expect(result.errors).toContain('StructureMap is required');
    });

    it('should return error for StructureMap without groups', () => {
      const invalidMap: StructureMap = {
        resourceType: 'StructureMap',
        name: 'Invalid',
        status: 'active',
        group: []
      };

      const result = executor.execute(invalidMap, {});

      expect(result.success).toBe(false);
      expect(result.errors).toContain('StructureMap must have at least one group');
    });
  });

  describe('validateStructureMap', () => {
    it('should validate correct StructureMap', () => {
      const validation = executor.validateStructureMap(testStructureMap);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject null StructureMap', () => {
      const validation = executor.validateStructureMap(null as any);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('StructureMap is null or undefined');
    });

    it('should reject StructureMap with wrong resourceType', () => {
      const invalidMap = { ...testStructureMap, resourceType: 'Patient' as any };
      const validation = executor.validateStructureMap(invalidMap);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Resource type must be "StructureMap"');
    });

    it('should reject StructureMap without groups', () => {
      const invalidMap = { ...testStructureMap, group: [] };
      const validation = executor.validateStructureMap(invalidMap);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('StructureMap must have at least one group');
    });
  });
});