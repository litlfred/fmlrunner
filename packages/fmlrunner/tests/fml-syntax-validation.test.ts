import { FmlCompiler } from '../src/lib/fml-compiler';
import { Logger } from '../src/lib/logger';

describe('FML Syntax Validation', () => {
  let compiler: FmlCompiler;
  let logger: Logger;

  beforeAll(() => {
    logger = new Logger('test');
    compiler = new FmlCompiler(logger);
  });

  describe('Valid FML Content', () => {
    test('should validate simple valid FML map', () => {
      const validFmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        }
      `;

      const result = compiler.validateSyntax(validFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('should validate complex FML map with imports', () => {
      const validFmlContent = `
        map "http://example.org/tutorial" = tutorial

        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias PatientOut as target

        group tutorial(source src : Patient, target tgt : PatientOut) {
          src.name as srcName -> tgt.name as tgtName then {
            srcName.given as given -> tgtName.given = given;
            srcName.family as family -> tgtName.family = family;
          };
        }
      `;

      const result = compiler.validateSyntax(validFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });

  describe('Invalid FML Content', () => {
    test('should detect empty content', () => {
      const result = compiler.validateSyntax('');
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toBe('FML content cannot be empty');
      expect(result.errors![0].code).toBe('EMPTY_CONTENT');
    });

    test('should detect missing map keyword', () => {
      const invalidFmlContent = `
        invalid "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        }
      `;

      const result = compiler.validateSyntax(invalidFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(e => e.code === 'MISSING_MAP_KEYWORD')).toBe(true);
    });

    test('should detect unmatched braces', () => {
      const invalidFmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        
      `;

      const result = compiler.validateSyntax(invalidFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(e => e.code === 'UNCLOSED_BRACE')).toBe(true);
    });

    test('should detect unmatched parentheses', () => {
      const invalidFmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight {
          src.a as a -> tgt.a = a;
        }
      `;

      const result = compiler.validateSyntax(invalidFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(e => e.code === 'UNCLOSED_PAREN')).toBe(true);
    });

    test('should detect extra closing braces', () => {
      const invalidFmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        }}
      `;

      const result = compiler.validateSyntax(invalidFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(e => e.code === 'UNMATCHED_BRACE')).toBe(true);
    });

    test('should handle syntax errors gracefully', () => {
      const invalidFmlContent = `
        invalid syntax here
        map without proper structure
        missing quotes and format
      `;

      const result = compiler.validateSyntax(invalidFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('Detailed Error Information', () => {
    test('should provide line and column information when available', () => {
      const invalidFmlContent = `map "test" = test
      
      group test(source src, target tgt) {
        src.a -> tgt.b;
      }}`;

      const result = compiler.validateSyntax(invalidFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      
      const unMatchedError = result.errors!.find(e => e.code === 'UNMATCHED_BRACE');
      expect(unMatchedError).toBeDefined();
      expect(unMatchedError!.line).toBeDefined();
      expect(unMatchedError!.column).toBeDefined();
    });

    test('should return both errors and warnings when present', () => {
      const problematicFmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
          // Missing closing brace - should generate error
      `;

      const result = compiler.validateSyntax(problematicFmlContent);
      expect(result.success).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors!.some(e => e.code === 'UNCLOSED_BRACE')).toBe(true);
    });
  });
});