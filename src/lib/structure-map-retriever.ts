// MIGRATION NOTE: This service can remain as a utility OR be replaced with kotlin-fhir file operations
// See: https://github.com/google/android-fhir
//
// TODO: Evaluate if file I/O operations should be migrated to Kotlin
// - Option 1: Keep as TypeScript utility for file system operations
// - Option 2: Implement in Kotlin using kotlinx.coroutines for async file I/O
// - Option 3: Use kotlin-fhir resource loading capabilities

import * as fs from 'fs/promises';
import * as path from 'path';

export class StructureMapRetriever {
  private baseDirectory: string;
  private cache: Map<string, any> = new Map();

  constructor(baseDirectory: string = './maps') {
    this.baseDirectory = baseDirectory;
    console.warn('StructureMapRetriever: Consider migrating to kotlin-fhir file operations');
  }

  async getStructureMap(reference: string): Promise<any | null> {
    throw new Error('StructureMapRetriever: Migrate to kotlin-fhir or keep as utility');
  }

  async loadFromFile(filename: string): Promise<any | null> {
    throw new Error('StructureMapRetriever: Migrate to kotlin-fhir file loading');
  }

  async loadFromUrl(url: string): Promise<any | null> {
    throw new Error('StructureMapRetriever: Migrate to kotlin-fhir HTTP client');
  }

  registerStructureMap(structureMap: any): void {
    throw new Error('StructureMapRetriever: Use kotlin-fhir resource management');
  }

  removeStructureMap(reference: string): boolean {
    throw new Error('StructureMapRetriever: Use kotlin-fhir resource management');
  }

  setBaseDirectory(directory: string): void {
    this.baseDirectory = directory;
  }

  clear(): void {
    this.cache.clear();
  }
}