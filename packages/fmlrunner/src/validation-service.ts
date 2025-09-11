import { StructureDefinition, ValidationResult, ValidationError, ValidationWarning } from '../types';

/**
 * Basic validation service for FHIR resources
 */
export class ValidationService {
  private structureDefinitions: Map<string, StructureDefinition> = new Map();

  /**
   * Register a StructureDefinition for validation
   */
  registerStructureDefinition(structureDefinition: StructureDefinition): void {
    if (structureDefinition.url) {
      this.structureDefinitions.set(structureDefinition.url, structureDefinition);
    }
    if (structureDefinition.name && structureDefinition.name !== structureDefinition.url) {
      this.structureDefinitions.set(structureDefinition.name, structureDefinition);
    }
  }

  /**
   * Validate a resource against a StructureDefinition
   */
  validate(resource: any, profileUrl: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      const structureDefinition = this.structureDefinitions.get(profileUrl);
      
      if (!structureDefinition) {
        errors.push({
          path: '',
          message: `StructureDefinition not found: ${profileUrl}`,
          severity: 'error'
        });
        return { valid: false, errors, warnings };
      }

      // Basic validation - check resource type matches
      if (resource.resourceType && resource.resourceType !== structureDefinition.type) {
        errors.push({
          path: 'resourceType',
          message: `Expected resourceType '${structureDefinition.type}', but got '${resource.resourceType}'`,
          severity: 'error'
        });
      }

      // Validate against snapshot elements if available
      if (structureDefinition.snapshot?.element) {
        this.validateElements(resource, structureDefinition.snapshot.element, structureDefinition.type, errors, warnings);
      }

    } catch (error) {
      errors.push({
        path: '',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate resource elements against ElementDefinitions
   */
  private validateElements(
    resource: any, 
    elements: any[], 
    resourceType: string, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    for (const element of elements) {
      if (!element.path) continue;

      const elementPath = element.path;
      const value = this.getValueAtPath(resource, elementPath, resourceType);

      // Skip root element validation for now (it's the resource itself)
      if (elementPath === resourceType) {
        continue;
      }

      // Check cardinality
      if (element.min !== undefined && element.min > 0) {
        if (value === undefined || value === null) {
          errors.push({
            path: elementPath,
            message: `Required element '${elementPath}' is missing (min: ${element.min})`,
            severity: 'error'
          });
        }
      }

      if (element.max !== undefined && element.max !== '*') {
        const maxValue = parseInt(element.max, 10);
        if (Array.isArray(value) && value.length > maxValue) {
          errors.push({
            path: elementPath,
            message: `Too many values for '${elementPath}' (max: ${element.max}, found: ${value.length})`,
            severity: 'error'
          });
        }
      }

      // Basic type checking
      if (value !== undefined && element.type && element.type.length > 0) {
        const expectedType = element.type[0].code;
        if (!this.isValidType(value, expectedType)) {
          warnings.push({
            path: elementPath,
            message: `Value at '${elementPath}' may not match expected type '${expectedType}'`,
            severity: 'warning'
          });
        }
      }
    }
  }

  /**
   * Get value at a given FHIR path (simplified implementation)
   */
  private getValueAtPath(resource: any, path: string, resourceType?: string): any {
    if (!path || !resource) return undefined;

    // Handle root resource path
    if (path === resourceType) {
      return resource;
    }

    const parts = path.split('.');
    let current = resource;

    // Skip the resource type part if it's the first part
    let startIndex = 0;
    if (parts[0] === resourceType) {
      startIndex = 1;
    }

    for (let i = startIndex; i < parts.length; i++) {
      if (current === null || current === undefined) return undefined;
      current = current[parts[i]];
    }

    return current;
  }

  /**
   * Basic type validation
   */
  private isValidType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean';
      case 'integer':
      case 'decimal':
        return typeof value === 'number';
      case 'date':
      case 'dateTime':
        return typeof value === 'string' && !isNaN(Date.parse(value));
      case 'code':
      case 'uri':
      case 'url':
        return typeof value === 'string';
      default:
        return true; // Unknown type, assume valid
    }
  }

  /**
   * Clear all registered StructureDefinitions
   */
  clearStructureDefinitions(): void {
    this.structureDefinitions.clear();
  }

  /**
   * Get all registered StructureDefinitions
   */
  getStructureDefinitions(): StructureDefinition[] {
    return Array.from(this.structureDefinitions.values());
  }
}