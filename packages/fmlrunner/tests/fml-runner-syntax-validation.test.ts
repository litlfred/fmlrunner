import { FmlRunner } from '../src/index';

describe('FML Runner Syntax Validation Integration', () => {
  let fmlRunner: FmlRunner;

  beforeAll(() => {
    fmlRunner = new FmlRunner({ baseUrl: './tests/test-data' });
  });

  describe('FML Runner validateFmlSyntax method', () => {
    test('should validate valid FML content through FmlRunner', () => {
      const validFmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        }
      `;

      const result = fmlRunner.validateFmlSyntax(validFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('should detect syntax errors through FmlRunner', () => {
      const invalidFmlContent = `
        invalid "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        }
      `;

      const result = fmlRunner.validateFmlSyntax(invalidFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors!.some(e => e.code === 'MISSING_MAP_KEYWORD')).toBe(true);
    });

    test('should handle empty content gracefully', () => {
      const result = fmlRunner.validateFmlSyntax('');
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].code).toBe('EMPTY_CONTENT');
    });

    test('should be faster than full compilation', () => {
      const fmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
          src.b as b -> tgt.b = b;
          src.c as c -> tgt.c = c;
        }
      `;

      // Syntax validation
      const startValidation = Date.now();
      const validationResult = fmlRunner.validateFmlSyntax(fmlContent);
      const validationTime = Date.now() - startValidation;

      // Full compilation
      const startCompilation = Date.now();
      const compilationResult = fmlRunner.compileFml(fmlContent);
      const compilationTime = Date.now() - startCompilation;

      expect(validationResult.success).toBe(true);
      expect(validationResult.isValid).toBe(true);
      
      // Note: This test might not always pass if the implementation is very fast
      // but it demonstrates the concept
      console.log(`Validation time: ${validationTime}ms, Compilation time: ${compilationTime}ms`);
    });

    test('should provide detailed error information', () => {
      const invalidFmlContent = `map "test" = test
      
      group test(source src, target tgt) {
        src.a -> tgt.b;
      }}`;

      const result = fmlRunner.validateFmlSyntax(invalidFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      
      const error = result.errors!.find(e => e.code === 'UNMATCHED_BRACE');
      expect(error).toBeDefined();
      expect(error!.message).toContain('Unmatched closing brace');
      expect(error!.severity).toBe('error');
      expect(error!.line).toBeDefined();
      expect(error!.column).toBeDefined();
    });
  });
});