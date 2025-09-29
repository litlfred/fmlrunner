// PHASE 2 COMPLETE: Now implemented in kotlin-fhir terminology services
// See: src/commonMain/kotlin/org/litlfred/fmlrunner/terminology/CodeSystemService.kt
//
// This TypeScript service has been replaced with kotlin-fhir CodeSystem APIs
// - Uses kotlin-fhir CodeSystem resource definitions  
// - Implements code lookup using kotlin-fhir APIs
// - Leverages kotlin-fhir terminology capabilities

export class CodeSystemService {
  constructor() {
    console.warn('CodeSystemService: This TypeScript implementation has been replaced with kotlin-fhir');
    console.warn('Use the Kotlin FmlRunner.registerCodeSystem() and FmlRunner.lookupCode() methods instead');
  }

  registerCodeSystem(codeSystem: any): void {
    throw new Error('CodeSystemService: Use FmlRunner.registerCodeSystem() with kotlin-fhir CodeSystem instead');
  }

  getCodeSystem(reference: string): any | null {
    throw new Error('CodeSystemService: Use FmlRunner.getCodeSystem() with kotlin-fhir implementation instead');
  }

  getAllCodeSystems(): any[] {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystemService.getAllCodeSystems() instead');
  }

  searchCodeSystems(params: any): any[] {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystemService.searchCodeSystems() instead');
  }

  removeCodeSystem(reference: string): boolean {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystemService.removeCodeSystem() instead');
  }

  validateCode(system: string, code: string, display?: string): any {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystemService.validateCode() instead');
  }

  lookupCode(system: string, code: string): any {
    throw new Error('CodeSystemService: Use FmlRunner.lookupCode() with kotlin-fhir implementation instead');
  }

  clear(): void {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystemService.clear() instead');
  }

  getCount(): number {
    throw new Error('CodeSystemService: Use kotlin-fhir CodeSystemService.getCount() instead');
  }
}