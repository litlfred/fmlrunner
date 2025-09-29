// MIGRATION NOTE: This service should be replaced with kotlin-fhir ValueSet APIs  
// See: https://github.com/google/android-fhir
//
// TODO: Replace with kotlin-fhir ValueSet validation services
// - Use kotlin-fhir ValueSet resource definitions
// - Implement code validation using kotlin-fhir APIs
// - Leverage kotlin-fhir terminology capabilities

export class ValueSetService {
  constructor() {
    console.warn('ValueSetService: This TypeScript implementation will be replaced with kotlin-fhir');
  }

  registerValueSet(valueSet: any): void {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet APIs instead');
  }

  getValueSet(reference: string): any | null {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet APIs instead');
  }

  getAllValueSets(): any[] {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet APIs instead');
  }

  searchValueSets(params: any): any[] {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet APIs instead');
  }

  removeValueSet(reference: string): boolean {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet APIs instead');
  }

  validateCode(code: string, system?: string, valueSetUrl?: string): any {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet validation instead');
  }

  expandValueSet(valueSetUrl: string): any {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet expansion instead');
  }

  clear(): void {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet APIs instead');
  }

  getCount(): number {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSet APIs instead');
  }
}