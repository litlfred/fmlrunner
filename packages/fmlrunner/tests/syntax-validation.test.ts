import { FmlRunner } from '../src/index';

describe('FML Syntax Validation', () => {
  let fmlRunner: FmlRunner;

  beforeEach(() => {
    fmlRunner = new FmlRunner({ 
      validateInputOutput: false  // Disable other validations to focus on syntax
    });
  });

  describe('Valid FML Syntax', () => {
    test('should validate basic map declaration', () => {
      const validFml = `map "http://example.org/StructureMap/Test" = "TestMap"

group main(source src, target tgt) {
  src.name -> tgt.fullName;
}`;

      const result = fmlRunner.validateFmlSyntax(validFml);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('should validate map with uses statements', () => {
      const validFml = `map "http://example.org/StructureMap/Test" = "TestMap"

uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
uses "http://example.org/StructureDefinition/MyPatient" alias MyPatient as target

group main(source src : Patient, target tgt : MyPatient) {
  src.name -> tgt.fullName;
}`;

      const result = fmlRunner.validateFmlSyntax(validFml);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid FML Syntax', () => {
    test('should detect empty content', () => {
      const result = fmlRunner.validateFmlSyntax('');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        message: 'FML content cannot be empty',
        line: 1,
        column: 1,
        severity: 'error',
        code: 'EMPTY_CONTENT'
      });
    });

    test('should detect missing map declaration', () => {
      const invalidFml = `group main(source src, target tgt) {
  src.name -> tgt.fullName;
}`;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.code === 'MISSING_MAP_DECLARATION')).toBe(true);
    });

    test('should detect unmatched braces', () => {
      const invalidFml = `map "http://example.org/StructureMap/Test" = "TestMap"

group main(source src, target tgt) {
  src.name -> tgt.fullName;
// Missing closing brace`;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNCLOSED_BRACE')).toBe(true);
    });

    test('should detect unmatched parentheses', () => {
      const invalidFml = `map "http://example.org/StructureMap/Test" = "TestMap"

group main(source src, target tgt {
  src.name -> tgt.fullName;
}`;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('parenthesis'))).toBe(true);
    });

    test('should provide detailed error information', () => {
      const invalidFml = `map = "TestMap"`;  // Missing URL

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check that errors have position information
      result.errors.forEach(error => {
        expect(error.line).toBeGreaterThan(0);
        expect(error.column).toBeGreaterThan(0);
        expect(error.severity).toBe('error');
        expect(error.message).toBeDefined();
      });
    });
  });

  describe('Syntax Warnings', () => {
    test('should warn about invalid URL format', () => {
      const fmlWithBadUrl = `map "not-a-valid-url" = "TestMap"

group main(source src, target tgt) {
  src.name -> tgt.fullName;
}`;

      const result = fmlRunner.validateFmlSyntax(fmlWithBadUrl);
      
      // Should still be valid syntax but with warnings
      expect(result.warnings.some(w => w.code === 'INVALID_URL_FORMAT')).toBe(true);
    });

    test('should warn about groups with no inputs', () => {
      const fmlWithEmptyGroup = `map "http://example.org/StructureMap/Test" = "TestMap"

group main() {
}`;

      const result = fmlRunner.validateFmlSyntax(fmlWithEmptyGroup);
      
      expect(result.warnings.some(w => w.code === 'NO_GROUP_INPUTS')).toBe(true);
    });
  });

  describe('Complex FML Structures', () => {
    test('should validate FML with conceptmap declarations', () => {
      const complexFml = `map "http://example.org/StructureMap/Test" = "TestMap"

conceptmap "http://example.org/ConceptMap/test" {
  prefix s = "http://source.system"
  prefix t = "http://target.system"
  
  s:code1 -> t:mappedCode1
}

group main(source src, target tgt) {
  src.name -> tgt.fullName;
}`;

      const result = fmlRunner.validateFmlSyntax(complexFml);
      
      // Should handle conceptmap blocks without errors
      expect(result.valid).toBe(true);
    });

    test('should validate FML with imports and prefix declarations', () => {
      const complexFml = `map "http://example.org/StructureMap/Test" = "TestMap"

imports "http://example.org/other-map"

prefix system = "http://example.org/system"

group main(source src, target tgt) {
  src.name -> tgt.fullName;
}`;

      const result = fmlRunner.validateFmlSyntax(complexFml);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('Error Position Accuracy', () => {
    test('should report correct line and column for errors', () => {
      const invalidFml = `map "http://example.org/StructureMap/Test" = "TestMap"

group main(source src, target tgt) {
  src.name -> tgt.fullName;
}
// Line 7: missing closing brace for group
group invalid(source src, target tgt {
  src.name -> tgt.fullName;
}`;

      const result = fmlRunner.validateFmlSyntax(invalidFml);
      
      expect(result.valid).toBe(false);
      
      // Check that at least one error is reported with reasonable position
      const hasReasonablePosition = result.errors.some(error => 
        error.line >= 7 && error.line <= 9 && error.column > 0
      );
      expect(hasReasonablePosition).toBe(true);
    });
  });
});