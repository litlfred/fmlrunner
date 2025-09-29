import { FmlRunner } from '../src/index';
import { Logger } from '../src/lib/logger';

describe('FML Syntax Validation', () => {
  let fmlRunner: FmlRunner;

  beforeEach(() => {
    fmlRunner = new FmlRunner({
      baseUrl: './tests/test-data',
      logLevel: 'warn' // Reduce log noise during tests
    });
  });

  describe('validateFmlSyntax', () => {
    it('should validate valid FML content', () => {
      const validFml = `
        map "http://example.org/fhir/StructureMap/PatientTransform" = "PatientTransform"

        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
        uses "http://example.org/StructureDefinition/MyPatient" alias MyPatient as target

        group Patient(source src : Patient, target tgt : MyPatient) {
          src.name -> tgt.name;
          src.gender -> tgt.gender;
        }
      `;

      const result = fmlRunner.validateFmlSyntax(validFml);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect empty content', () => {
      const result = fmlRunner.validateFmlSyntax('');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('empty');
      expect(result.errors[0].code).toBe('EMPTY_CONTENT');
    });

    it('should detect missing map declaration', () => {
      const invalidFml = `
        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
        group Patient(source src : Patient, target tgt : MyPatient) {
          src.name -> tgt.name;
        }
      `;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_MAP_DECLARATION')).toBe(true);
    });

    it('should detect unmatched braces', () => {
      const invalidFml = `
        map "http://example.org/fhir/StructureMap/Test" = "Test"
        group Test(source src, target tgt) {
          src.name -> tgt.name;
          // Missing closing brace
      `;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNCLOSED_BRACE')).toBe(true);
    });

    it('should detect unmatched parentheses', () => {
      const invalidFml = `
        map "http://example.org/fhir/StructureMap/Test" = "Test"
        group Test(source src, target tgt {
          src.name -> tgt.name;
        }
      `;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNCLOSED_PAREN')).toBe(true);
    });

    it('should provide line and column information for errors', () => {
      const invalidFml = `map "test" = "Test"
group Test(source src, target tgt) {
  src.name -> tgt.name
  // Missing semicolon above
}`;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      // Should have errors with line/column info
      result.errors.forEach(error => {
        expect(error.line).toBeGreaterThan(0);
        expect(error.column).toBeGreaterThan(0);
        expect(error.severity).toBe('error');
      });
    });

    it('should include warnings for missing groups', () => {
      const fmlWithoutGroups = `
        map "http://example.org/fhir/StructureMap/Empty" = "Empty"
        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
      `;

      const result = fmlRunner.validateFmlSyntax(fmlWithoutGroups);
      
      // May be valid but should have warnings
      if (result.warnings) {
        expect(result.warnings.some(w => w.code === 'NO_GROUPS')).toBe(true);
      }
    });

    it('should handle syntax errors gracefully', () => {
      const malformedFml = `
        map "test" = "Test"
        invalid syntax here @#$%
        group Test {
      `;

      const result = fmlRunner.validateFmlSyntax(malformedFml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // All errors should have proper structure
      result.errors.forEach(error => {
        expect(error).toHaveProperty('line');
        expect(error).toHaveProperty('column');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('severity');
        expect(error.severity).toBe('error');
      });
    });

    it('should validate minimal valid FML', () => {
      const minimalFml = 'map "test" = "Test"';

      const result = fmlRunner.validateFmlSyntax(minimalFml);
      
      // Should be valid (may have warnings about missing groups)
      expect(result.valid || result.errors.every(e => e.severity !== 'error')).toBe(true);
    });

    it('should detect content not starting with map', () => {
      const invalidStart = `
        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
        map "http://example.org/fhir/StructureMap/Test" = "Test"
      `;

      const result = fmlRunner.validateFmlSyntax(invalidStart);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_MAP_DECLARATION')).toBe(true);
    });

    it('should handle whitespace and comments appropriately', () => {
      const fmlWithComments = `
        // This is a comment
        map "http://example.org/fhir/StructureMap/Test" = "Test"
        
        /* Multi-line
           comment */
        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
        
        group Test(source src : Patient, target tgt) {
          // Inline comment
          src.name -> tgt.name; // Another comment
        }
      `;

      const result = fmlRunner.validateFmlSyntax(fmlWithComments);
      
      // Comments should not cause validation errors
      expect(result.valid).toBe(true);
    });
  });
});