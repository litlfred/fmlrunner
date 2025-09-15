import * as fs from 'fs/promises';
import * as path from 'path';
import { StructureMap } from '../types';
import { Logger } from './logger';

/**
 * StructureMap retrieval service - loads StructureMaps from files or URLs
 */
export class StructureMapRetriever {
  private baseDirectory: string;
  private cache: Map<string, StructureMap> = new Map();
  private logger: Logger;

  constructor(logger: Logger, baseDirectory: string = './maps') {
    this.logger = logger;
    this.baseDirectory = baseDirectory;
  }

  /**
   * Retrieve StructureMap by reference (file path or URL)
   */
  async getStructureMap(reference: string): Promise<StructureMap | null> {
    try {
      // Check cache first
      if (this.cache.has(reference)) {
        return this.cache.get(reference) || null;
      }

      let structureMap: StructureMap | null = null;

      if (reference.startsWith('http')) {
        // Load from URL
        structureMap = await this.loadFromUrl(reference);
      } else {
        // Load from file
        structureMap = await this.loadFromFile(reference);
      }

      // Cache the result
      if (structureMap) {
        this.cache.set(reference, structureMap);
      }

      return structureMap;
    } catch (error) {
      console.error(`Error retrieving StructureMap ${reference}:`, error);
      return null;
    }
  }

  /**
   * Load StructureMap from local file
   */
  private async loadFromFile(filename: string): Promise<StructureMap | null> {
    try {
      const filePath = path.resolve(this.baseDirectory, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const structureMap = JSON.parse(content) as StructureMap;
      
      // Basic validation
      if (structureMap.resourceType !== 'StructureMap') {
        throw new Error('Invalid StructureMap: resourceType must be "StructureMap"');
      }

      return structureMap;
    } catch (error) {
      console.error(`Error loading StructureMap from file ${filename}:`, error);
      return null;
    }
  }

  /**
   * Load StructureMap from URL
   */
  private async loadFromUrl(url: string): Promise<StructureMap | null> {
    try {
      // Note: Using fetch() available in Node.js 18+
      // For older versions, would need to use a library like node-fetch
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const structureMap = await response.json() as StructureMap;
      
      // Basic validation
      if (structureMap.resourceType !== 'StructureMap') {
        throw new Error('Invalid StructureMap: resourceType must be "StructureMap"');
      }

      return structureMap;
    } catch (error) {
      console.error(`Error loading StructureMap from URL ${url}:`, error);
      return null;
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set base directory for file loading
   */
  setBaseDirectory(directory: string): void {
    this.baseDirectory = directory;
  }
}