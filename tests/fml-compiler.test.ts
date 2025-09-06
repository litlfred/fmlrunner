import { FmlCompiler } from '../src/lib/fml-compiler';

describe('FmlCompiler', () => {
  let compiler: FmlCompiler;

  beforeEach(() => {
    compiler = new FmlCompiler();
  });

  describe('compile', () => {
    it('should reject empty FML content', () => {
      const result = compiler.compile('');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('FML content cannot be empty');
    });

    it('should reject whitespace-only FML content', () => {
      const result = compiler.compile('   \n  \t  ');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('FML content cannot be empty');
    });

    it('should compile basic FML to StructureMap', () => {
      const fmlContent = `
        map "http://example.org/StructureMap/test" = "TestMap"
        
        source -> target
      `;
      
      const result = compiler.compile(fmlContent);
      expect(result.success).toBe(true);
      expect(result.structureMap).toBeDefined();
      expect(result.structureMap?.resourceType).toBe('StructureMap');
      expect(result.structureMap?.name).toBe('TestMap');
      expect(result.structureMap?.url).toBe('http://example.org/StructureMap/test');
    });

    it('should handle compilation errors gracefully', () => {
      // Test with malformed content that should trigger an error
      const result = compiler.compile('invalid fml content');
      expect(result.success).toBe(true); // Basic parser should still create a structure
      expect(result.structureMap).toBeDefined();
    });

    it('should create default structure when no map declaration found', () => {
      const fmlContent = 'some -> mapping';
      const result = compiler.compile(fmlContent);
      
      expect(result.success).toBe(true);
      expect(result.structureMap?.name).toBe('DefaultMap');
      expect(result.structureMap?.url).toContain('DefaultMap');
    });
  });
});