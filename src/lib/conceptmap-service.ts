// MIGRATION NOTE: This service should be replaced with kotlin-fhir ConceptMap APIs
// See: https://github.com/google/android-fhir
// 
// TODO: Replace with kotlin-fhir ConceptMap validation and translation services
// - Use kotlin-fhir ConceptMap resource definitions
// - Implement concept translation using kotlin-fhir APIs
// - Leverage kotlin-fhir terminology capabilities

export class ConceptMapService {
  constructor() {
    console.warn('ConceptMapService: This TypeScript implementation will be replaced with kotlin-fhir');
  }

  registerConceptMap(conceptMap: any): void {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMap APIs instead');
  }

  getConceptMap(reference: string): any | null {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMap APIs instead');
  }

  getAllConceptMaps(): any[] {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMap APIs instead');
  }

  searchConceptMaps(params: any): any[] {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMap APIs instead');
  }

  removeConceptMap(reference: string): boolean {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMap APIs instead');
  }

  translate(sourceSystem: string, sourceCode: string, targetSystem?: string): any[] {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMap translation instead');
  }

  clear(): void {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMap APIs instead');
  }

  getCount(): number {
    throw new Error('ConceptMapService: Use kotlin-fhir ConceptMap APIs instead');
  }
}