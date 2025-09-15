import { ValueSet } from '../types';

/**
 * Service for managing ValueSet resources
 */
export class ValueSetService {
  private valueSets: Map<string, ValueSet> = new Map();

  /**
   * Register a ValueSet resource
   */
  registerValueSet(valueSet: ValueSet): void {
    if (valueSet.id) {
      this.valueSets.set(valueSet.id, valueSet);
    }
    if (valueSet.url) {
      this.valueSets.set(valueSet.url, valueSet);
    }
  }

  /**
   * Get ValueSet by ID or URL
   */
  getValueSet(reference: string): ValueSet | null {
    return this.valueSets.get(reference) || null;
  }

  /**
   * Get all ValueSets
   */
  getAllValueSets(): ValueSet[] {
    const unique = new Map<string, ValueSet>();
    this.valueSets.forEach((valueSet) => {
      const key = valueSet.id || valueSet.url || Math.random().toString();
      unique.set(key, valueSet);
    });
    return Array.from(unique.values());
  }

  /**
   * Search ValueSets by parameters
   */
  searchValueSets(params: {
    name?: string;
    status?: string;
    url?: string;
    publisher?: string;
    jurisdiction?: string;
  }): ValueSet[] {
    let results = this.getAllValueSets();

    if (params.name) {
      results = results.filter(vs => 
        vs.name?.toLowerCase().includes(params.name!.toLowerCase()) ||
        vs.title?.toLowerCase().includes(params.name!.toLowerCase())
      );
    }

    if (params.status) {
      results = results.filter(vs => vs.status === params.status);
    }

    if (params.url) {
      results = results.filter(vs => vs.url === params.url);
    }

    if (params.publisher) {
      results = results.filter(vs => 
        vs.publisher?.toLowerCase().includes(params.publisher!.toLowerCase())
      );
    }

    if (params.jurisdiction) {
      results = results.filter(vs => 
        vs.jurisdiction?.some(j => 
          j.coding?.some(c => c.code === params.jurisdiction || c.display?.includes(params.jurisdiction!))
        )
      );
    }

    return results;
  }

  /**
   * Remove ValueSet by ID or URL
   */
  removeValueSet(reference: string): boolean {
    const valueSet = this.valueSets.get(reference);
    if (valueSet) {
      // Remove by both ID and URL if present
      if (valueSet.id) {
        this.valueSets.delete(valueSet.id);
      }
      if (valueSet.url) {
        this.valueSets.delete(valueSet.url);
      }
      return true;
    }
    return false;
  }

  /**
   * Check if a code is in a ValueSet
   */
  validateCode(
    valueSetRef: string,
    system?: string,
    code?: string,
    display?: string
  ): { result: boolean; message?: string } {
    const valueSet = this.getValueSet(valueSetRef);
    if (!valueSet) {
      return { result: false, message: `ValueSet not found: ${valueSetRef}` };
    }

    // Check expanded codes first
    if (valueSet.expansion?.contains) {
      const found = this.findInExpansion(valueSet.expansion.contains, system, code, display);
      if (found) {
        return { result: true };
      }
    }

    // Check compose includes
    if (valueSet.compose?.include) {
      for (const include of valueSet.compose.include) {
        if (system && include.system && include.system !== system) {
          continue;
        }

        // Check specific concepts
        if (include.concept) {
          for (const concept of include.concept) {
            if (concept.code === code) {
              if (!display || concept.display === display) {
                return { result: true };
              }
            }
          }
        }

        // If no specific concepts and system matches, assume code is valid
        if (!include.concept && include.system === system && code) {
          return { result: true };
        }
      }
    }

    return { result: false, message: `Code not found in ValueSet: ${code}` };
  }

  /**
   * Helper method to search expansion
   */
  private findInExpansion(
    contains: any[],
    system?: string,
    code?: string,
    display?: string
  ): boolean {
    for (const item of contains) {
      if (system && item.system && item.system !== system) {
        continue;
      }

      if (item.code === code) {
        if (!display || item.display === display) {
          return true;
        }
      }

      // Check nested contains
      if (item.contains) {
        if (this.findInExpansion(item.contains, system, code, display)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Expand a ValueSet (basic implementation)
   */
  expand(valueSetRef: string, count?: number, offset?: number): ValueSet | null {
    const valueSet = this.getValueSet(valueSetRef);
    if (!valueSet) {
      return null;
    }

    // If already expanded, return as-is
    if (valueSet.expansion) {
      return valueSet;
    }

    // Basic expansion - would need code system lookup for full implementation
    const expandedValueSet = { ...valueSet };
    expandedValueSet.expansion = {
      timestamp: new Date().toISOString(),
      total: 0,
      contains: []
    };

    if (valueSet.compose?.include) {
      const allConcepts: any[] = [];
      for (const include of valueSet.compose.include) {
        if (include.concept) {
          for (const concept of include.concept) {
            allConcepts.push({
              system: include.system,
              code: concept.code,
              display: concept.display
            });
          }
        }
      }

      expandedValueSet.expansion.total = allConcepts.length;
      
      if (offset) {
        allConcepts.splice(0, offset);
      }
      if (count) {
        allConcepts.splice(count);
      }

      expandedValueSet.expansion.contains = allConcepts;
    }

    return expandedValueSet;
  }

  /**
   * Clear all ValueSets
   */
  clear(): void {
    this.valueSets.clear();
  }

  /**
   * Get count of registered ValueSets
   */
  getCount(): number {
    return this.getAllValueSets().length;
  }
}