import { FmlRunner } from '../src';
import * as path from 'path';

describe('FmlRunner', () => {
  let runner: FmlRunner;
  const testDataDir = path.join(__dirname, 'test-data');

  beforeEach(() => {
    runner = new FmlRunner({ baseUrl: testDataDir });
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
    it('should execute StructureMap from file', async () => {
      const inputData = { name: 'John Doe' };
      const result = await runner.executeStructureMap('test-structure-map.json', inputData);
      
      expect(result.success).toBe(true);
      expect(result.result).toEqual({ fullName: 'John Doe' });
    });

    it('should return error for non-existent StructureMap', async () => {
      const result = await runner.executeStructureMap('non-existent.json', {});
      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('StructureMap not found');
    });
  });

  describe('getStructureMap', () => {
    it('should retrieve StructureMap from file', async () => {
      const structureMap = await runner.getStructureMap('test-structure-map.json');
      expect(structureMap).toBeDefined();
      expect(structureMap?.resourceType).toBe('StructureMap');
      expect(structureMap?.name).toBe('TestMap');
    });

    it('should return null for non-existent file', async () => {
      const result = await runner.getStructureMap('non-existent.json');
      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear cache without errors', () => {
      expect(() => runner.clearCache()).not.toThrow();
    });
  });

  describe('setBaseDirectory', () => {
    it('should update base directory', () => {
      const newDir = '/new/path';
      expect(() => runner.setBaseDirectory(newDir)).not.toThrow();
    });
  });
});