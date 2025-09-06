import { StructureMap, ExecutionResult } from '../types';

/**
 * StructureMap execution engine - executes StructureMaps on input data
 */
export class StructureMapExecutor {
  
  /**
   * Execute a StructureMap on input content
   */
  execute(structureMap: StructureMap, inputContent: any): ExecutionResult {
    try {
      // Basic validation
      if (!structureMap) {
        return {
          success: false,
          errors: ['StructureMap is required']
        };
      }

      if (!structureMap.group || structureMap.group.length === 0) {
        return {
          success: false,
          errors: ['StructureMap must have at least one group']
        };
      }

      // Execute the main group
      const mainGroup = structureMap.group.find(g => g.name === 'main') || structureMap.group[0];
      const result = this.executeGroup(mainGroup, inputContent);

      return {
        success: true,
        result
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown execution error']
      };
    }
  }

  /**
   * Execute a group within a StructureMap
   */
  private executeGroup(group: any, inputContent: any): any {
    // This is a basic implementation - a real StructureMap executor would be much more complex
    // and would need to handle FHIR Path expressions, complex transformations, etc.
    
    const result: any = {};

    // Process each rule in the group
    if (group.rule) {
      for (const rule of group.rule) {
        this.executeRule(rule, inputContent, result);
      }
    }

    return result;
  }

  /**
   * Execute a single mapping rule
   */
  private executeRule(rule: any, source: any, target: any): void {
    try {
      // Basic rule execution - map simple element to element
      if (rule.source && rule.target && rule.source.length > 0 && rule.target.length > 0) {
        const sourceElement = rule.source[0].element;
        const targetElement = rule.target[0].element;
        
        if (sourceElement && targetElement && source[sourceElement] !== undefined) {
          target[targetElement] = source[sourceElement];
        }
      }
    } catch (error) {
      console.error('Error executing rule:', error);
    }
  }

  /**
   * Validate that a StructureMap can be executed
   */
  validateStructureMap(structureMap: StructureMap): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!structureMap) {
      errors.push('StructureMap is null or undefined');
      return { valid: false, errors };
    }

    if (structureMap.resourceType !== 'StructureMap') {
      errors.push('Resource type must be "StructureMap"');
    }

    if (!structureMap.group || structureMap.group.length === 0) {
      errors.push('StructureMap must have at least one group');
    }

    if (structureMap.group) {
      for (let i = 0; i < structureMap.group.length; i++) {
        const group = structureMap.group[i];
        if (!group.name) {
          errors.push(`Group ${i} must have a name`);
        }
        if (!group.input || group.input.length === 0) {
          errors.push(`Group ${i} must have at least one input`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}