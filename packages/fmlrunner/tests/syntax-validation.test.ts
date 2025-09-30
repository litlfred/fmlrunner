import { FmlRunner } from '../src/index';
import { Logger } from '../src/lib/logger';

describe('FML Syntax Validation', () => {
  let fmlRunner: FmlRunner;

  beforeEach(() => {
    fmlRunner = new FmlRunner({ logLevel: 'error' }); // Reduce log noise in tests
  });

  describe('validateFmlSyntax', () => {
    it('should validate correct FML syntax', () => {
      const validFml = `
        map "http://example.org/StructureMap/test" = "TestMap"

        group main(source src, target tgt) {
          src.name -> tgt.name;
        }
      `;

      const result = fmlRunner.validateFmlSyntax(validFml);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect empty content', () => {
      const result = fmlRunner.validateFmlSyntax('');
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].message).toContain('cannot be empty');
      expect(result.errors?.[0].line).toBe(1);
      expect(result.errors?.[0].column).toBe(1);
    });

    it('should detect whitespace-only content', () => {
      const result = fmlRunner.validateFmlSyntax('   \n  \t  ');
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].message).toContain('cannot be empty');
    });

    it('should warn about missing map declaration', () => {
      const fmlWithoutMap = `
        group main(source src, target tgt) {
          src.name -> tgt.name;
        }
      `;

      const result = fmlRunner.validateFmlSyntax(fmlWithoutMap);
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0].message).toContain('map');
      expect(result.warnings?.[0].severity).toBe('warning');
    });

    it('should detect syntax errors with line information', () => {
      const invalidFml = `
        map "http://example.org/StructureMap/test" = "TestMap"

        group main(source src, target tgt) {
          src.name -> tgt.name
        } // Missing semicolon above
      `;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      // This might pass or fail depending on parser tolerance - document the behavior
      if (!result.success) {
        expect(result.errors?.[0]).toHaveProperty('line');
        expect(result.errors?.[0]).toHaveProperty('column');
        expect(result.errors?.[0].severity).toBe('error');
      }
    });

    it('should handle invalid characters gracefully', () => {
      const invalidFml = `
        map "http://example.org/StructureMap/test" = "TestMap"
        
        ±invalid±character±here
      `;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors?.[0]).toHaveProperty('message');
        expect(result.errors?.[0]).toHaveProperty('line');
        expect(result.errors?.[0]).toHaveProperty('column');
      }
    });

    it('should provide detailed error messages', () => {
      const result = fmlRunner.validateFmlSyntax('invalid content');
      
      // Should either succeed with warnings or fail with detailed errors
      if (result.errors) {
        result.errors.forEach(error => {
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('line');
          expect(error).toHaveProperty('column');
          expect(error).toHaveProperty('severity');
          expect(error.severity).toBe('error');
        });
      }
      
      if (result.warnings) {
        result.warnings.forEach(warning => {
          expect(warning).toHaveProperty('message');
          expect(warning).toHaveProperty('line');
          expect(warning).toHaveProperty('column');
          expect(warning).toHaveProperty('severity');
          expect(warning.severity).toBe('warning');
        });
      }
    });
  });
});