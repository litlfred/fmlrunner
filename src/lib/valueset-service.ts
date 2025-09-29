// PHASE 2 COMPLETE: Now implemented in kotlin-fhir terminology services
// See: src/commonMain/kotlin/org/litlfred/fmlrunner/terminology/ValueSetService.kt
//
// This TypeScript service has been replaced with kotlin-fhir ValueSet APIs  
// - Uses kotlin-fhir ValueSet resource definitions
// - Implements code validation using kotlin-fhir APIs
// - Leverages kotlin-fhir terminology capabilities

export class ValueSetService {
  constructor() {
    console.warn('ValueSetService: This TypeScript implementation has been replaced with kotlin-fhir');
    console.warn('Use the Kotlin FmlRunner.registerValueSet() and FmlRunner.validateCodeInValueSet() methods instead');
  }

  registerValueSet(valueSet: any): void {
    throw new Error('ValueSetService: Use FmlRunner.registerValueSet() with kotlin-fhir ValueSet instead');
  }

  getValueSet(reference: string): any | null {
    throw new Error('ValueSetService: Use FmlRunner.getValueSet() with kotlin-fhir implementation instead');
  }

  getAllValueSets(): any[] {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSetService.getAllValueSets() instead');
  }

  searchValueSets(params: any): any[] {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSetService.searchValueSets() instead');
  }

  removeValueSet(reference: string): boolean {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSetService.removeValueSet() instead');
  }

  validateCode(code: string, system?: string, valueSetUrl?: string): any {
    throw new Error('ValueSetService: Use FmlRunner.validateCodeInValueSet() with kotlin-fhir implementation instead');
  }

  expandValueSet(valueSetUrl: string): any {
    throw new Error('ValueSetService: Use FmlRunner.expandValueSet() with kotlin-fhir implementation instead');
  }

  clear(): void {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSetService.clear() instead');
  }

  getCount(): number {
    throw new Error('ValueSetService: Use kotlin-fhir ValueSetService.getCount() instead');
  }
}