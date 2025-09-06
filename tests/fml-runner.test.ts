import { FmlRunner } from '../src';

describe('FmlRunner', () => {
  let runner: FmlRunner;

  beforeEach(() => {
    runner = new FmlRunner();
  });

  describe('compileFml', () => {
    it('should compile valid FML content', () => {
      const fmlContent = `
        map "http://example.org/StructureMap/test" = "TestMap"
        source -> target
      `;
      
      const result = runner.compileFml(fmlContent);
      expect(result.success).toBe(true);
      expect(result.structureMap).toBeDefined();
    });

    it('should reject empty FML content', () => {
      const result = runner.compileFml('');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('executeStructureMap', () => {
    it('should return not implemented error for now', async () => {
      const result = await runner.executeStructureMap('test-map', {});
      expect(result.success).toBe(false);
      expect(result.errors).toContain('StructureMap execution not yet implemented');
    });
  });

  describe('getStructureMap', () => {
    it('should return null for now', async () => {
      const result = await runner.getStructureMap('test-reference');
      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear cache without errors', () => {
      expect(() => runner.clearCache()).not.toThrow();
    });
  });
});