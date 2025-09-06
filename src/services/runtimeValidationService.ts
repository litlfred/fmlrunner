/**
 * Runtime Validation Service for FML Runner
 * 
 * This service provides runtime validation of JSON data against TypeScript-generated
 * JSON schemas using AJV. It serves as a bridge between TypeScript compile-time
 * type checking and runtime data validation for FHIR resources and logical models.
 */

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning, 
  RuntimeValidationConfig,
  ValidatedData 
} from '../types/core';

export class RuntimeValidationService {
  private ajv: Ajv;
  private validators: Map<string, ValidateFunction> = new Map();
  private schemas: Map<string, any> = new Map();
  private config: RuntimeValidationConfig;

  constructor(config: Partial<RuntimeValidationConfig> = {}) {
    this.config = {
      strict: false,
      throwOnError: false,
      coerceTypes: true,
      removeAdditional: true,
      ...config
    };

    this.ajv = new Ajv({
      strict: this.config.strict,
      coerceTypes: this.config.coerceTypes,
      removeAdditional: this.config.removeAdditional,
      allErrors: true,
      verbose: true
    });

    // Add format support (date, time, email, etc.)
    addFormats(this.ajv);

    // Add custom formats for FML Runner specific validation
    this.addCustomFormats();
  }

  /**
   * Register a JSON schema for validation
   */
  registerSchema<T>(schemaName: string, schema: any): void {
    try {
      const validator = this.ajv.compile(schema);
      this.validators.set(schemaName, validator);
      this.schemas.set(schemaName, schema);
    } catch (error) {
      console.error(`Failed to register schema ${schemaName}:`, error);
      if (this.config.throwOnError) {
        throw new Error(`Failed to register schema ${schemaName}: ${error}`);
      }
    }
  }

  /**
   * Validate data against a registered schema
   */
  validate<T>(schemaName: string, data: unknown): ValidatedData<T> {
    const validator = this.validators.get(schemaName);
    if (!validator) {
      const error: ValidationError = {
        code: 'SCHEMA_NOT_FOUND',
        message: `Schema '${schemaName}' not registered`,
        path: '',
        value: schemaName
      };

      if (this.config.throwOnError) {
        throw new Error(error.message);
      }

      return {
        data: data as T,
        isValid: false,
        errors: [error],
        warnings: []
      };
    }

    const isValid = validator(data);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!isValid && validator.errors) {
      for (const error of validator.errors) {
        const validationError: ValidationError = {
          code: error.keyword?.toUpperCase() || 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
          path: error.instancePath,
          value: error.data
        };
        errors.push(validationError);
      }
    }

    if (!isValid && this.config.throwOnError) {
      throw new Error(`Validation failed for schema '${schemaName}': ${errors.map(e => e.message).join(', ')}`);
    }

    return {
      data: data as T,
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Type-safe validation with automatic casting
   */
  validateAndCast<T>(schemaName: string, data: unknown): T {
    const result = this.validate<T>(schemaName, data);
    
    if (!result.isValid) {
      if (this.config.throwOnError) {
        throw new Error(`Validation failed: ${result.errors.map(e => e.message).join(', ')}`);
      }
      console.warn(`Validation failed for schema '${schemaName}':`, result.errors);
    }

    return result.data;
  }

  /**
   * Validate data and return Promise for async workflows
   */
  async validateAsync<T>(schemaName: string, data: unknown): Promise<ValidatedData<T>> {
    return Promise.resolve(this.validate<T>(schemaName, data));
  }

  /**
   * Bulk validation of multiple data items
   */
  validateBatch<T>(schemaName: string, dataArray: unknown[]): ValidatedData<T>[] {
    return dataArray.map(data => this.validate<T>(schemaName, data));
  }

  /**
   * Validate FHIR resource against its StructureDefinition
   */
  validateFHIRResource(resource: any, structureDefinition: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic FHIR resource validation
    if (!resource.resourceType) {
      errors.push({
        code: 'MISSING_RESOURCE_TYPE',
        message: 'FHIR resource must have a resourceType',
        path: 'resourceType',
        value: resource
      });
    }

    // Validate against StructureDefinition if provided
    if (structureDefinition && structureDefinition.snapshot) {
      const validationResult = this.validateAgainstStructureDefinition(resource, structureDefinition);
      errors.push(...validationResult.errors);
      warnings.push(...validationResult.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate data against a FHIR StructureDefinition
   */
  private validateAgainstStructureDefinition(data: any, structureDefinition: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!structureDefinition.snapshot || !structureDefinition.snapshot.element) {
      warnings.push({
        code: 'NO_SNAPSHOT',
        message: 'StructureDefinition has no snapshot - cannot validate',
        path: '',
        value: structureDefinition.url
      });
      return { isValid: true, errors, warnings };
    }

    // Validate required elements
    for (const element of structureDefinition.snapshot.element) {
      if (element.min && element.min > 0) {
        const path = element.path;
        const value = this.getValueAtPath(data, path);
        
        if (value === undefined || value === null) {
          errors.push({
            code: 'REQUIRED_ELEMENT_MISSING',
            message: `Required element '${path}' is missing`,
            path: path,
            value: undefined
          });
        }
      }

      // Validate cardinality
      if (element.max && element.max !== '*') {
        const maxCount = parseInt(element.max);
        const path = element.path;
        const value = this.getValueAtPath(data, path);
        
        if (Array.isArray(value) && value.length > maxCount) {
          errors.push({
            code: 'CARDINALITY_VIOLATION',
            message: `Element '${path}' has ${value.length} items but max is ${maxCount}`,
            path: path,
            value: value.length
          });
        }
      }

      // Validate fixed values
      if (element.fixedString && element.path) {
        const value = this.getValueAtPath(data, element.path);
        if (value !== undefined && value !== element.fixedString) {
          errors.push({
            code: 'FIXED_VALUE_VIOLATION',
            message: `Element '${element.path}' must have fixed value '${element.fixedString}' but has '${value}'`,
            path: element.path,
            value: value
          });
        }
      }

      // Validate constraints
      if (element.constraint) {
        for (const constraint of element.constraint) {
          if (constraint.severity === 'error' && constraint.expression) {
            // In a real implementation, you would evaluate the FHIRPath expression
            // For now, we'll just log it as a warning
            warnings.push({
              code: 'CONSTRAINT_NOT_EVALUATED',
              message: `Constraint '${constraint.key}' not evaluated: ${constraint.human}`,
              path: element.path,
              value: constraint.expression
            });
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get value at a specific path in an object
   */
  private getValueAtPath(obj: any, path: string): any {
    if (!path || !obj) return undefined;
    
    // Handle simple paths for now (no array indexing or complex expressions)
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    
    return current;
  }

  /**
   * Check if a schema is registered
   */
  hasSchema(schemaName: string): boolean {
    return this.validators.has(schemaName);
  }

  /**
   * Get list of registered schema names
   */
  getRegisteredSchemas(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * Get the raw JSON schema for a registered schema
   */
  getSchema(schemaName: string): any | null {
    return this.schemas.get(schemaName) || null;
  }

  /**
   * Remove a registered schema
   */
  unregisterSchema(schemaName: string): void {
    this.validators.delete(schemaName);
    this.schemas.delete(schemaName);
  }

  /**
   * Clear all registered schemas
   */
  clearSchemas(): void {
    this.validators.clear();
    this.schemas.clear();
  }

  /**
   * Update validation configuration
   */
  updateConfig(newConfig: Partial<RuntimeValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate AJV instance with new config
    this.ajv = new Ajv({
      strict: this.config.strict,
      coerceTypes: this.config.coerceTypes,
      removeAdditional: this.config.removeAdditional,
      allErrors: true,
      verbose: true
    });

    addFormats(this.ajv);
    this.addCustomFormats();

    // Re-register all schemas with new AJV instance
    const schemasToReregister = Array.from(this.schemas.entries());
    this.validators.clear();
    
    for (const [name, schema] of schemasToReregister) {
      try {
        const validator = this.ajv.compile(schema);
        this.validators.set(name, validator);
      } catch (error) {
        console.error(`Failed to re-register schema ${name}:`, error);
      }
    }
  }

  /**
   * Add custom formats for FML Runner specific validation
   */
  private addCustomFormats(): void {
    // FHIR ID format
    this.ajv.addFormat('fhir-id', {
      type: 'string',
      validate: (id: string) => {
        return /^[A-Za-z0-9\-\.]{1,64}$/.test(id);
      }
    });

    // FHIR URI format
    this.ajv.addFormat('fhir-uri', {
      type: 'string',
      validate: (uri: string) => {
        // Basic URI validation
        try {
          new URL(uri);
          return true;
        } catch {
          return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(uri);
        }
      }
    });

    // FHIR canonical URL format
    this.ajv.addFormat('fhir-canonical', {
      type: 'string',
      validate: (canonical: string) => {
        // Canonical URLs can have version suffix
        const parts = canonical.split('|');
        if (parts.length > 2) return false;
        
        const url = parts[0];
        try {
          new URL(url);
          return true;
        } catch {
          return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(url);
        }
      }
    });

    // FHIR version format
    this.ajv.addFormat('fhir-version', {
      type: 'string',
      validate: (version: string) => {
        return /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)*$/.test(version);
      }
    });

    // FHIRPath expression (basic validation)
    this.ajv.addFormat('fhirpath', {
      type: 'string',
      validate: (expression: string) => {
        // Basic FHIRPath validation - not empty and reasonable characters
        return expression.length > 0 && /^[a-zA-Z0-9.\(\)\[\]'":\s\-_]+$/.test(expression);
      }
    });
  }
}

// Create and export a default instance
export const runtimeValidator = new RuntimeValidationService({
  strict: false,
  throwOnError: false,
  coerceTypes: true,
  removeAdditional: true
});

// Create a strict instance for strict mode validation
export const strictRuntimeValidator = new RuntimeValidationService({
  strict: true,
  throwOnError: true,
  coerceTypes: false,
  removeAdditional: false
});

// Export convenience functions
export const validateData = <T>(schemaName: string, data: unknown): ValidatedData<T> => {
  return runtimeValidator.validate<T>(schemaName, data);
};

export const validateDataStrict = <T>(schemaName: string, data: unknown): ValidatedData<T> => {
  return strictRuntimeValidator.validate<T>(schemaName, data);
};

export const validateAndCast = <T>(schemaName: string, data: unknown): T => {
  return runtimeValidator.validateAndCast<T>(schemaName, data);
};

export const registerSchema = <T>(schemaName: string, schema: any): void => {
  runtimeValidator.registerSchema(schemaName, schema);
  strictRuntimeValidator.registerSchema(schemaName, schema);
};

/**
 * Decorator for automatic validation of function parameters
 */
export function ValidateParams(schemaName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const validationResult = runtimeValidator.validate(schemaName, args[0]);
      
      if (!validationResult.isValid) {
        console.warn(`Parameter validation failed for ${propertyName}:`, validationResult.errors);
        if (runtimeValidator['config'].throwOnError) {
          throw new Error(`Parameter validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
        }
      }
      
      return method.apply(this, args);
    };
  };
}

/**
 * Decorator for automatic validation of function return values
 */
export function ValidateReturn(schemaName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const result = method.apply(this, args);
      
      // Handle Promise returns
      if (result && typeof result.then === 'function') {
        return result.then((resolvedResult: any) => {
          const validationResult = runtimeValidator.validate(schemaName, resolvedResult);
          
          if (!validationResult.isValid) {
            console.warn(`Return value validation failed for ${propertyName}:`, validationResult.errors);
          }
          
          return resolvedResult;
        });
      }
      
      // Handle synchronous returns
      const validationResult = runtimeValidator.validate(schemaName, result);
      
      if (!validationResult.isValid) {
        console.warn(`Return value validation failed for ${propertyName}:`, validationResult.errors);
      }
      
      return result;
    };
  };
}