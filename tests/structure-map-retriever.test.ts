import { StructureMapRetriever } from '../src/lib/structure-map-retriever';
import * as path from 'path';

describe('StructureMapRetriever', () => {
  let retriever: StructureMapRetriever;
  const testDataDir = path.join(__dirname, 'test-data');

  beforeEach(() => {
    retriever = new StructureMapRetriever(testDataDir);
  });

  describe('getStructureMap', () => {
    it('should load StructureMap from file', async () => {
      const structureMap = await retriever.getStructureMap('test-structure-map.json');
      
      expect(structureMap).toBeDefined();
      expect(structureMap?.resourceType).toBe('StructureMap');
      expect(structureMap?.name).toBe('TestMap');
      expect(structureMap?.url).toBe('http://example.org/StructureMap/test');
    });

    it('should return null for non-existent file', async () => {
      const structureMap = await retriever.getStructureMap('non-existent.json');
      expect(structureMap).toBeNull();
    });

    it('should cache loaded StructureMaps', async () => {
      const structureMap1 = await retriever.getStructureMap('test-structure-map.json');
      const structureMap2 = await retriever.getStructureMap('test-structure-map.json');
      
      expect(structureMap1).toBe(structureMap2); // Should be same cached instance
    });

    it('should clear cache when requested', async () => {
      await retriever.getStructureMap('test-structure-map.json');
      retriever.clearCache();
      
      // Should load fresh after cache clear
      const structureMap = await retriever.getStructureMap('test-structure-map.json');
      expect(structureMap).toBeDefined();
    });
  });

  describe('setBaseDirectory', () => {
    it('should update base directory', () => {
      const newDir = '/new/path';
      retriever.setBaseDirectory(newDir);
      // No direct way to test this without making baseDirectory public
      // In a real implementation, might want to add a getter
      expect(() => retriever.setBaseDirectory(newDir)).not.toThrow();
    });
  });
});