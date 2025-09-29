// MIGRATION NOTE: This service should be replaced with kotlin-fhir validation APIs
// See: https://github.com/google/android-fhir
//
// TODO: Replace with kotlin-fhir resource validation
// - Use kotlin-fhir StructureDefinition validation
// - Implement profile validation using kotlin-fhir APIs
// - Leverage kotlin-fhir validation engine

export class ValidationService {
  constructor() {
    console.warn('ValidationService: This TypeScript implementation will be replaced with kotlin-fhir');
  }

  validateResource(resource: any, structureDefinition: any): any {
    throw new Error('ValidationService: Use kotlin-fhir resource validation instead');
  }

  validateProfile(resource: any, profileUrl: string): any {
    throw new Error('ValidationService: Use kotlin-fhir profile validation instead');
  }

  validateConstraint(resource: any, constraint: string): any {
    throw new Error('ValidationService: Use kotlin-fhir constraint validation instead');
  }

  validateDataType(value: any, dataType: string): any {
    throw new Error('ValidationService: Use kotlin-fhir data type validation instead');
  }

  clear(): void {
    throw new Error('ValidationService: Use kotlin-fhir validation APIs instead');
  }
}