// PHASE 2 COMPLETE: Now implemented in kotlin-fhir terminology services
// See: src/commonMain/kotlin/org/litlfred/fmlrunner/terminology/ValidationService.kt
//
// This TypeScript service has been replaced with kotlin-fhir validation APIs
// - Uses kotlin-fhir StructureDefinition validation
// - Implements profile validation using kotlin-fhir APIs
// - Leverages kotlin-fhir validation engine

export class ValidationService {
  constructor() {
    console.warn('ValidationService: This TypeScript implementation has been replaced with kotlin-fhir');
    console.warn('Use the Kotlin FmlRunner.registerStructureDefinition() and FmlRunner.validateResource() methods instead');
  }

  validateResource(resource: any, structureDefinition: any): any {
    throw new Error('ValidationService: Use FmlRunner.validateResource() with kotlin-fhir implementation instead');
  }

  validateProfile(resource: any, profileUrl: string): any {
    throw new Error('ValidationService: Use kotlin-fhir ValidationService.validateProfile() instead');
  }

  validateConstraint(resource: any, constraint: string): any {
    throw new Error('ValidationService: Use kotlin-fhir constraint validation instead');
  }

  validateDataType(value: any, dataType: string): any {
    throw new Error('ValidationService: Use kotlin-fhir data type validation instead');
  }

  clear(): void {
    throw new Error('ValidationService: Use kotlin-fhir ValidationService.clear() instead');
  }
}