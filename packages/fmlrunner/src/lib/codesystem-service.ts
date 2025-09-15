import { CodeSystem } from '../types';
import { Logger } from './logger';

/**
 * Service for managing CodeSystem resources
 */
export class CodeSystemService {
  private codeSystems: Map<string, CodeSystem> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register a CodeSystem resource
   */
  registerCodeSystem(codeSystem: CodeSystem): void {
    if (codeSystem.id) {
      this.codeSystems.set(codeSystem.id, codeSystem);
    }
    if (codeSystem.url) {
      this.codeSystems.set(codeSystem.url, codeSystem);
    }
  }

  /**
   * Get CodeSystem by ID or URL
   */
  getCodeSystem(reference: string): CodeSystem | null {
    return this.codeSystems.get(reference) || null;
  }

  /**
   * Get all CodeSystems
   */
  getAllCodeSystems(): CodeSystem[] {
    const unique = new Map<string, CodeSystem>();
    this.codeSystems.forEach((codeSystem) => {
      const key = codeSystem.id || codeSystem.url || Math.random().toString();
      unique.set(key, codeSystem);
    });
    return Array.from(unique.values());
  }

  /**
   * Search CodeSystems by parameters
   */
  searchCodeSystems(params: {
    name?: string;
    status?: string;
    url?: string;
    system?: string;
    publisher?: string;
    content?: string;
  }): CodeSystem[] {
    let results = this.getAllCodeSystems();

    if (params.name) {
      results = results.filter(cs => 
        cs.name?.toLowerCase().includes(params.name!.toLowerCase()) ||
        cs.title?.toLowerCase().includes(params.name!.toLowerCase())
      );
    }

    if (params.status) {
      results = results.filter(cs => cs.status === params.status);
    }

    if (params.url || params.system) {
      const searchUrl = params.url || params.system;
      results = results.filter(cs => cs.url === searchUrl);
    }

    if (params.publisher) {
      results = results.filter(cs => 
        cs.publisher?.toLowerCase().includes(params.publisher!.toLowerCase())
      );
    }

    if (params.content) {
      results = results.filter(cs => cs.content === params.content);
    }

    return results;
  }

  /**
   * Remove CodeSystem by ID or URL
   */
  removeCodeSystem(reference: string): boolean {
    const codeSystem = this.codeSystems.get(reference);
    if (codeSystem) {
      // Remove by both ID and URL if present
      if (codeSystem.id) {
        this.codeSystems.delete(codeSystem.id);
      }
      if (codeSystem.url) {
        this.codeSystems.delete(codeSystem.url);
      }
      return true;
    }
    return false;
  }

  /**
   * Validate a code in a CodeSystem
   */
  validateCode(
    systemRef: string,
    code: string,
    display?: string
  ): { result: boolean; display?: string; message?: string } {
    const codeSystem = this.getCodeSystem(systemRef);
    if (!codeSystem) {
      return { result: false, message: `CodeSystem not found: ${systemRef}` };
    }

    if (!codeSystem.concept) {
      // If no concepts defined, assume code is valid if CodeSystem exists
      return { result: true, message: 'CodeSystem contains no concept definitions' };
    }

    const found = this.findConcept(codeSystem.concept, code);
    if (found) {
      if (display && found.display && found.display !== display) {
        return { 
          result: false, 
          message: `Display mismatch. Expected: ${found.display}, got: ${display}` 
        };
      }
      return { result: true, display: found.display };
    }

    return { result: false, message: `Code not found in CodeSystem: ${code}` };
  }

  /**
   * Helper method to recursively search concepts
   */
  private findConcept(concepts: any[], code: string): any | null {
    for (const concept of concepts) {
      if (concept.code === code) {
        return concept;
      }
      // Search nested concepts
      if (concept.concept) {
        const found = this.findConcept(concept.concept, code);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Get concept definition from CodeSystem
   */
  lookup(
    systemRef: string,
    code: string,
    property?: string[]
  ): {
    name?: string;
    display?: string;
    definition?: string;
    designation?: any[];
    property?: any[];
  } | null {
    const codeSystem = this.getCodeSystem(systemRef);
    if (!codeSystem?.concept) {
      return null;
    }

    const concept = this.findConcept(codeSystem.concept, code);
    if (!concept) {
      return null;
    }

    const result: any = {
      name: codeSystem.name,
      display: concept.display,
      definition: concept.definition
    };

    if (concept.designation) {
      result.designation = concept.designation;
    }

    if (concept.property && property) {
      result.property = concept.property.filter((p: any) => 
        property.includes(p.code)
      );
    } else if (concept.property) {
      result.property = concept.property;
    }

    return result;
  }

  /**
   * Subsumption testing (basic implementation)
   */
  subsumes(
    systemRef: string,
    codeA: string,
    codeB: string
  ): 'equivalent' | 'subsumes' | 'subsumed-by' | 'not-subsumed' {
    const codeSystem = this.getCodeSystem(systemRef);
    if (!codeSystem?.concept) {
      return 'not-subsumed';
    }

    if (codeA === codeB) {
      return 'equivalent';
    }

    // Basic implementation - would need hierarchy traversal for full support
    const conceptA = this.findConcept(codeSystem.concept, codeA);
    const conceptB = this.findConcept(codeSystem.concept, codeB);

    if (!conceptA || !conceptB) {
      return 'not-subsumed';
    }

    // Check if B is a child of A
    if (this.isChildOf(conceptA, codeB)) {
      return 'subsumes';
    }

    // Check if A is a child of B
    if (this.isChildOf(conceptB, codeA)) {
      return 'subsumed-by';
    }

    return 'not-subsumed';
  }

  /**
   * Helper to check if a concept has a child with the given code
   */
  private isChildOf(concept: any, code: string): boolean {
    if (!concept.concept) {
      return false;
    }

    for (const child of concept.concept) {
      if (child.code === code) {
        return true;
      }
      if (this.isChildOf(child, code)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clear all CodeSystems
   */
  clear(): void {
    this.codeSystems.clear();
  }

  /**
   * Get count of registered CodeSystems
   */
  getCount(): number {
    return this.getAllCodeSystems().length;
  }
}