// MIGRATION NOTE: This service should be replaced with kotlin-fhir Bundle processing
// See: https://github.com/google/android-fhir
//
// TODO: Replace with kotlin-fhir Bundle processing APIs
// - Use kotlin-fhir Bundle resource definitions
// - Implement resource distribution using kotlin-fhir APIs
// - Leverage kotlin-fhir terminology and validation services

export interface BundleProcessingResult {
  success: boolean;
  processed: {
    structureMaps: number;
    structureDefinitions: number; 
    conceptMaps: number;
    valueSets: number;
    codeSystems: number;
    other: number;
  };
  errors: string[];
  warnings: string[];
}

export class BundleService {
  constructor() {
    console.warn('BundleService: This TypeScript implementation will be replaced with kotlin-fhir');
  }

  async processBundle(bundle: any): Promise<BundleProcessingResult> {
    throw new Error('BundleService: Use kotlin-fhir Bundle processing instead');
  }

  getStats(): any {
    throw new Error('BundleService: Use kotlin-fhir Bundle processing instead');
  }

  clear(): void {
    throw new Error('BundleService: Use kotlin-fhir Bundle processing instead');
  }
}