// PHASE 2 COMPLETE: Now implemented in kotlin-fhir terminology services
// See: src/commonMain/kotlin/org/litlfred/fmlrunner/terminology/BundleService.kt
//
// This TypeScript service has been replaced with kotlin-fhir Bundle processing APIs
// - Uses kotlin-fhir Bundle resource definitions
// - Implements resource distribution using kotlin-fhir APIs
// - Leverages kotlin-fhir terminology and validation services

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
    console.warn('BundleService: This TypeScript implementation has been replaced with kotlin-fhir');
    console.warn('Use the Kotlin FmlRunner.processBundle() and FmlRunner.getBundleStats() methods instead');
  }

  async processBundle(bundle: any): Promise<BundleProcessingResult> {
    throw new Error('BundleService: Use FmlRunner.processBundle() with kotlin-fhir implementation instead');
  }

  getStats(): any {
    throw new Error('BundleService: Use FmlRunner.getBundleStats() with kotlin-fhir implementation instead');
  }

  clear(): void {
    throw new Error('BundleService: Use kotlin-fhir BundleService.clear() instead');
  }
}