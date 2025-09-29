import { FmlRunner } from '../src/lib/kotlin-bridge';

describe('Kotlin Core Integration', () => {
  let runner: FmlRunner;

  beforeEach(() => {
    runner = new FmlRunner();
  });

  describe('FML Compilation', () => {
    it('should compile valid FML content using Kotlin core', () => {
      const fmlContent = `
        map "http://example.org/StructureMap/Patient" = "PatientTransform"
        
        group main(source src, target tgt) {
          src.name -> tgt.fullName;
          src.active -> tgt.isActive;
        }
      `;

      const result = runner.compileFml(fmlContent);
      
      expect(result.success).toBe(true);
      expect(result.structureMap).toBeDefined();
      expect(result.structureMap?.name).toBe('PatientTransform');
      expect(result.structureMap?.url).toBe('http://example.org/StructureMap/Patient');
    });

    it('should handle invalid FML content', () => {
      const invalidFml = 'invalid fml content';
      
      const result = runner.compileFml(invalidFml);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('StructureMap Execution', () => {
    beforeEach(() => {
      // Register a test StructureMap
      const structureMap = {
        resourceType: 'StructureMap' as const,
        url: 'http://example.org/StructureMap/Test',
        name: 'TestMap',
        status: 'active' as const,
        group: [{
          name: 'main',
          input: [
            { name: 'src', mode: 'source' as const },
            { name: 'tgt', mode: 'target' as const }
          ],
          rule: [{
            source: [{ context: 'src', element: 'name' }],
            target: [{ context: 'tgt', element: 'fullName' }]
          }]
        }]
      };

      runner.registerStructureMap(structureMap);
    });

    it('should execute StructureMap transformation', async () => {
      const inputData = { name: 'John Doe', active: true };
      
      const result = await runner.executeStructureMap(
        'http://example.org/StructureMap/Test',
        inputData
      );
      
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it('should handle missing StructureMap', async () => {
      const result = await runner.executeStructureMap(
        'http://example.org/StructureMap/NonExistent',
        { test: 'data' }
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('StructureMap not found: http://example.org/StructureMap/NonExistent');
    });
  });

  describe('StructureMap Management', () => {
    it('should register and retrieve StructureMaps', () => {
      const structureMap = {
        resourceType: 'StructureMap' as const,
        url: 'http://example.org/StructureMap/Register',
        name: 'RegisterTest',
        status: 'active' as const,
        group: []
      };

      const registered = runner.registerStructureMap(structureMap);
      expect(registered).toBe(true);

      const retrieved = runner.getStructureMap('http://example.org/StructureMap/Register');
      expect(retrieved).toEqual(structureMap);
    });

    it('should search StructureMaps by criteria', () => {
      // Register multiple StructureMaps
      const maps = [
        {
          resourceType: 'StructureMap' as const,
          url: 'http://example.org/StructureMap/Search1',
          name: 'SearchTest1',
          status: 'active' as const,
          group: []
        },
        {
          resourceType: 'StructureMap' as const,
          url: 'http://example.org/StructureMap/Search2', 
          name: 'SearchTest2',
          status: 'draft' as const,
          group: []
        }
      ];

      maps.forEach(map => runner.registerStructureMap(map));

      const activeResults = runner.searchStructureMaps({ status: 'active' });
      expect(activeResults.length).toBe(1);
      expect(activeResults[0].name).toBe('SearchTest1');

      const nameResults = runner.searchStructureMaps({ name: 'SearchTest2' });
      expect(nameResults.length).toBe(1);
      expect(nameResults[0].name).toBe('SearchTest2');
    });

    it('should remove StructureMaps', () => {
      const structureMap = {
        resourceType: 'StructureMap' as const,
        url: 'http://example.org/StructureMap/Remove',
        name: 'RemoveTest',
        status: 'active' as const,
        group: []
      };

      runner.registerStructureMap(structureMap);
      expect(runner.getCount()).toBe(1);

      const removed = runner.removeStructureMap('http://example.org/StructureMap/Remove');
      expect(removed).toBe(true);
      expect(runner.getCount()).toBe(0);
    });

    it('should clear all StructureMaps', () => {
      const structureMap = {
        resourceType: 'StructureMap' as const,
        url: 'http://example.org/StructureMap/Clear',
        name: 'ClearTest',
        status: 'active' as const,
        group: []
      };

      runner.registerStructureMap(structureMap);
      expect(runner.getCount()).toBe(1);

      runner.clear();
      expect(runner.getCount()).toBe(0);
    });
  });

  describe('Cross-Platform Validation', () => {
    it('should validate StructureMap structure', () => {
      const validMap = {
        resourceType: 'StructureMap' as const,
        url: 'http://example.org/StructureMap/Valid',
        name: 'ValidMap',
        status: 'active' as const,
        group: [{
          name: 'main',
          input: [
            { name: 'src', mode: 'source' as const },
            { name: 'tgt', mode: 'target' as const }
          ],
          rule: [{
            source: [{ context: 'src' }],
            target: [{ context: 'tgt' }]
          }]
        }]
      };

      const validation = runner.validateStructureMap(validMap);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid StructureMap structure', () => {
      const invalidMap = {
        resourceType: 'StructureMap' as const,
        url: 'http://example.org/StructureMap/Invalid',
        name: 'InvalidMap',
        status: 'active' as const,
        group: [] // Empty group array is invalid
      };

      const validation = runner.validateStructureMap(invalidMap);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});