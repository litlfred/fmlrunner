import { FmlCompiler } from '../src/lib/fml-compiler';

describe('Enhanced FML Tokenizer', () => {
  let compiler: FmlCompiler;

  beforeEach(() => {
    compiler = new FmlCompiler();
  });

  test('should handle multi-line comments', () => {
    const fmlWithMultiLineComment = `
      /* This is a multi-line comment
         spanning multiple lines */
      map "http://example.org/test" = "TestMap"

      group main(source : Patient) {
        name : source.name -> target.name;
      }
    `;

    const result = compiler.compile(fmlWithMultiLineComment);
    expect(result.success).toBe(true);
    expect(result.structureMap?.url).toBe('http://example.org/test');
    expect(result.structureMap?.name).toBe('TestMap');
  });

  test('should handle documentation comments', () => {
    const fmlWithDocComment = `
      /// This is a documentation comment
      map "http://example.org/test2" = "TestMap2"

      group main(source : Patient) {
        name : source.name -> target.name;
      }
    `;

    const result = compiler.compile(fmlWithDocComment);
    expect(result.success).toBe(true);
    expect(result.structureMap?.url).toBe('http://example.org/test2');
    expect(result.structureMap?.name).toBe('TestMap2');
  });

  test('should handle prefix declarations', () => {
    const fmlWithPrefix = `
      map "http://example.org/test3" = "TestMap3"
      prefix system = "http://terminology.hl7.org/CodeSystem/v3-ActCode"

      group main(source : Patient) {
        name : source.name -> target.name;
      }
    `;

    const result = compiler.compile(fmlWithPrefix);
    expect(result.success).toBe(true);
    expect(result.structureMap?.url).toBe('http://example.org/test3');
    expect(result.structureMap?.name).toBe('TestMap3');
  });

  test('should handle conceptmap declarations', () => {
    const fmlWithConceptMap = `
      map "http://example.org/test4" = "TestMap4"
      conceptmap "http://example.org/conceptmap" {
        target "http://terminology.hl7.org/CodeSystem/observation-category"
        element[0].target.code = "survey"
      }

      group main(source : Patient) {
        name : source.name -> target.name;
      }
    `;

    const result = compiler.compile(fmlWithConceptMap);
    expect(result.success).toBe(true);
    expect(result.structureMap?.url).toBe('http://example.org/test4');
    expect(result.structureMap?.name).toBe('TestMap4');
  });

  test('should handle all enhanced preamble features combined', () => {
    const fmlWithAllFeatures = `
      /* Multi-line comment explaining the mapping */
      /// Documentation for this map
      map "http://example.org/comprehensive" = "ComprehensiveMap"

      prefix loinc = "http://loinc.org"
      uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
      imports "http://example.org/other-map"

      conceptmap "http://example.org/codes" {
        target "http://terminology.hl7.org/CodeSystem/observation-category"
      }

      group main(source Patient : Patient, target : Patient) {
        // Single line comment  
        name : source.name -> target.name;
      }
    `;

    const result = compiler.compile(fmlWithAllFeatures);
    expect(result.success).toBe(true);
    expect(result.structureMap?.url).toBe('http://example.org/comprehensive');
    expect(result.structureMap?.name).toBe('ComprehensiveMap');
    expect(result.structureMap?.group).toHaveLength(1);
    expect(result.structureMap?.group[0].name).toBe('main');
  });

  test('should handle nested braces in conceptmap declarations', () => {
    const fmlWithNestedBraces = `
      map "http://example.org/nested" = "NestedMap"
      conceptmap "http://example.org/complex" {
        target "http://terminology.hl7.org/CodeSystem/observation-category"
        group MyGroup {
          element[0] {
            target.code = "survey"
            target.display = "Survey"
          }
        }
      }

      group main(source : Patient) {
        name : source.name -> target.name;
      }
    `;

    const result = compiler.compile(fmlWithNestedBraces);
    expect(result.success).toBe(true);
    expect(result.structureMap?.url).toBe('http://example.org/nested');
    expect(result.structureMap?.name).toBe('NestedMap');
  });

  test('should handle mixed comment types', () => {
    const fmlWithMixedComments = `
      /* Multi-line comment at the start */
      /// Documentation comment
      map "http://example.org/mixed" = "MixedComments"
      
      // Single line comment
      /* Another multi-line
         comment block */
      
      group main(source : Patient) {
        /// Documentation for this rule
        name : source.name -> target.name; // Inline comment
      }
    `;

    const result = compiler.compile(fmlWithMixedComments);
    expect(result.success).toBe(true);
    expect(result.structureMap?.url).toBe('http://example.org/mixed');
    expect(result.structureMap?.name).toBe('MixedComments');
  });
});