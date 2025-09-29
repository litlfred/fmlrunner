// MIGRATION NOTE: This service should be replaced with kotlin-fhir CodeSystem APIs
// See: https://github.com/google/android-fhir
//
// TODO: Replace with kotlin-fhir CodeSystem validation services
// - Use kotlin-fhir CodeSystem resource definitions  
// - Implement code lookup using kotlin-fhir APIs
// - Leverage kotlin-fhir terminology capabilities

export class CodeSystemService {
  constructor() {
    console.warn('CodeSystemService: This TypeScript implementation will be replaced with kotlin-fhir');
  }

  registerCodeSystem(codeSystem: any): void {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem APIs instead');
  }

  getCodeSystem(reference: string): any | null {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem APIs instead');
  }

  getAllCodeSystems(): any[] {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem APIs instead');
  }

  searchCodeSystems(params: any): any[] {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem APIs instead');
  }

  removeCodeSystem(reference: string): boolean {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem APIs instead');
  }

  validateCode(system: string, code: string, display?: string): any {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem validation instead');
  }

  lookupCode(system: string, code: string): any {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem lookup instead');
  }

  clear(): void {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem APIs instead');
  }

  getCount(): number {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystem APIs instead');
  }
}