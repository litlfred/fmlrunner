// PHASE 2 COMPLETE: Now implemented in kotlin-fhir terminology services
// See: src/commonMain/kotlin/org/litlfred/fmlrunner/terminology/ConceptMapService.kt
//
// This TypeScript service has been replaced with kotlin-fhir ConceptMap APIs
// - Uses kotlin-fhir ConceptMap resource definitions
// - Implements concept translation using kotlin-fhir APIs
// - Leverages kotlin-fhir terminology capabilities

export class ConceptMapService {
  constructor() {
    console.warn('ConceptMapService: This TypeScript implementation has been replaced with kotlin-fhir');
    console.warn('Use the Kotlin FmlRunner.registerConceptMap() and FmlRunner.translateCode() methods instead');
  }

  registerConceptMap(conceptMap: any): void {
    throw new Error('ConceptMapService: Use FmlRunner.registerConceptMap() with kotlin-fhir ConceptMap instead');
  }

  getConceptMap(reference: string): any | null {
    throw new Error('ConceptMapService: Use FmlRunner.getConceptMap() with kotlin-fhir implementation instead');
  }

  getAllConceptMaps(): any[] {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMapService.getAllConceptMaps() instead');
  }

  searchConceptMaps(params: any): any[] {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMapService.searchConceptMaps() instead');
  }

  removeConceptMap(reference: string): boolean {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMapService.removeConceptMap() instead');
  }

  translate(sourceSystem: string, sourceCode: string, targetSystem?: string): any[] {
    throw new Error('ConceptMapService: Use FmlRunner.translateCode() with kotlin-fhir implementation instead');
  }

  clear(): void {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMapService.clear() instead');
  }

  getCount(): number {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMapService.getCount() instead');
  }
}