import { ConceptMap } from '../types';
import { Logger } from './logger';

/**
 * Service for managing ConceptMap resources
 */
export class ConceptMapService {
  private conceptMaps: Map<string, ConceptMap> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register a ConceptMap resource
   */
  registerConceptMap(conceptMap: ConceptMap): void {
    if (conceptMap.id) {
      this.conceptMaps.set(conceptMap.id, conceptMap);
    }
    if (conceptMap.url) {
      this.conceptMaps.set(conceptMap.url, conceptMap);
    }
  }

  /**
   * Get ConceptMap by ID or URL
   */
  getConceptMap(reference: string): ConceptMap | null {
    return this.conceptMaps.get(reference) || null;
  }

  /**
   * Get all ConceptMaps
   */
  getAllConceptMaps(): ConceptMap[] {
    const unique = new Map<string, ConceptMap>();
    this.conceptMaps.forEach((conceptMap) => {
      const key = conceptMap.id || conceptMap.url || Math.random().toString();
      unique.set(key, conceptMap);
    });
    return Array.from(unique.values());
  }

  /**
   * Search ConceptMaps by parameters
   */
  searchConceptMaps(params: {
    name?: string;
    status?: string;
    url?: string;
    source?: string;
    target?: string;
  }): ConceptMap[] {
    let results = this.getAllConceptMaps();

    if (params.name) {
      results = results.filter(cm => 
        cm.name?.toLowerCase().includes(params.name!.toLowerCase())
      );
    }

    if (params.status) {
      results = results.filter(cm => cm.status === params.status);
    }

    if (params.url) {
      results = results.filter(cm => cm.url === params.url);
    }

    if (params.source) {
      results = results.filter(cm => 
        cm.sourceUri === params.source || cm.sourceCanonical === params.source
      );
    }

    if (params.target) {
      results = results.filter(cm => 
        cm.targetUri === params.target || cm.targetCanonical === params.target
      );
    }

    return results;
  }

  /**
   * Remove ConceptMap by ID or URL
   */
  removeConceptMap(reference: string): boolean {
    const conceptMap = this.conceptMaps.get(reference);
    if (conceptMap) {
      // Remove by both ID and URL if present
      if (conceptMap.id) {
        this.conceptMaps.delete(conceptMap.id);
      }
      if (conceptMap.url) {
        this.conceptMaps.delete(conceptMap.url);
      }
      return true;
    }
    return false;
  }

  /**
   * Translate a code using ConceptMaps
   */
  translate(
    sourceSystem: string,
    sourceCode: string,
    targetSystem?: string
  ): Array<{ system?: string; code?: string; display?: string; equivalence: string }> {
    const results: Array<{ system?: string; code?: string; display?: string; equivalence: string }> = [];

    // Find relevant ConceptMaps
    const relevantMaps = this.getAllConceptMaps().filter(cm => {
      const sourceMatch = cm.sourceUri === sourceSystem || cm.sourceCanonical === sourceSystem;
      const targetMatch = !targetSystem || cm.targetUri === targetSystem || cm.targetCanonical === targetSystem;
      return sourceMatch && targetMatch;
    });

    // Search for translations
    for (const conceptMap of relevantMaps) {
      if (conceptMap.group) {
        for (const group of conceptMap.group) {
          if (group.source === sourceSystem || !group.source) {
            for (const element of group.element) {
              if (element.code === sourceCode && element.target) {
                for (const target of element.target) {
                  results.push({
                    system: group.target,
                    code: target.code,
                    display: target.display,
                    equivalence: target.equivalence
                  });
                }
              }
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Clear all ConceptMaps
   */
  clear(): void {
    this.conceptMaps.clear();
  }

  /**
   * Get count of registered ConceptMaps
   */
  getCount(): number {
    return this.getAllConceptMaps().length;
  }
}