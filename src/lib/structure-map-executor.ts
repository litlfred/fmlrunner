import { StructureMap, ExecutionResult, ExecutionOptions, EnhancedExecutionResult } from '../types';
import { ValidationService } from './validation-service';
import { ConceptMapService } from './conceptmap-service';
import { ValueSetService } from './valueset-service';
import { CodeSystemService } from './codesystem-service';

/**
 * StructureMap execution engine - executes StructureMaps on input data
 */
export class StructureMapExecutor {
  private validationService: ValidationService;
  private conceptMapService?: ConceptMapService;
  private valueSetService?: ValueSetService;
  private codeSystemService?: CodeSystemService;

  constructor() {
    this.validationService = new ValidationService();
  }

  /**
   * Set terminology services for advanced transformation support
   */
  setTerminologyServices(
    conceptMapService: ConceptMapService,
    valueSetService: ValueSetService,
    codeSystemService: CodeSystemService
  ): void {
    this.conceptMapService = conceptMapService;
    this.valueSetService = valueSetService;
    this.codeSystemService = codeSystemService;
  }

  /**
   * Execute a StructureMap on input content with optional validation
   */
  execute(structureMap: StructureMap, inputContent: any, options?: ExecutionOptions): EnhancedExecutionResult {
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

      const result: EnhancedExecutionResult = {
        success: true,
        result: undefined,
        validation: {}
      };

      // Validate input if requested
      if (options?.validateInput && options?.inputProfile) {
        const inputValidation = this.validationService.validate(inputContent, options.inputProfile);
        result.validation!.input = inputValidation;

        if (!inputValidation.valid && options?.strictMode) {
          return {
            success: false,
            errors: [`Input validation failed: ${inputValidation.errors.map(e => e.message).join(', ')}`],
            validation: result.validation
          };
        }
      }

      // Execute the main group
      const mainGroup = structureMap.group.find(g => g.name === 'main') || structureMap.group[0];
      const transformResult = this.executeGroup(mainGroup, inputContent);
      result.result = transformResult;

      // Validate output if requested
      if (options?.validateOutput && options?.outputProfile) {
        const outputValidation = this.validationService.validate(transformResult, options.outputProfile);
        result.validation!.output = outputValidation;

        if (!outputValidation.valid && options?.strictMode) {
          return {
            success: false,
            errors: [`Output validation failed: ${outputValidation.errors.map(e => e.message).join(', ')}`],
            validation: result.validation
          };
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown execution error']
      };
    }
  }

  /**
   * Get the validation service for registering StructureDefinitions
   */
  getValidationService(): ValidationService {
    return this.validationService;
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
          let value = source[sourceElement];
          
          // Check if target has transform operations
          const targetRule = rule.target[0];
          if (targetRule.transform) {
            value = this.applyTransform(targetRule.transform, value, targetRule.parameter);
          }
          
          target[targetElement] = value;
        }
      }
    } catch (error) {
      console.error('Error executing rule:', error);
    }
  }

  /**
   * Apply transform operations including terminology operations
   */
  private applyTransform(transform: string, value: any, parameters?: any[]): any {
    switch (transform) {
      case 'copy':
        return value;
        
      case 'translate':
        return this.applyTranslateTransform(value, parameters);
        
      case 'evaluate':
        // FHIRPath evaluation - basic implementation
        return this.evaluateFhirPath(value, parameters);
        
      case 'create':
        // Create a new resource/element
        return this.createResource(parameters);
        
      case 'reference':
        // Create a reference
        return this.createReference(value, parameters);
        
      case 'dateOp':
        // Date operations
        return this.applyDateOperation(value, parameters);
        
      case 'append':
        // String append operation
        return this.appendStrings(value, parameters);
        
      case 'cast':
        // Type casting
        return this.castValue(value, parameters);
        
      default:
        console.warn(`Unknown transform: ${transform}`);
        return value;
    }
  }

  /**
   * Apply translate transform using ConceptMaps
   */
  private applyTranslateTransform(value: any, parameters?: any[]): any {
    if (!this.conceptMapService || !parameters || parameters.length < 2) {
      return value;
    }

    try {
      const sourceSystem = parameters[0];
      const targetSystem = parameters[1];
      
      if (typeof value === 'object' && value.code && value.system) {
        // Handle Coding input
        const translations = this.conceptMapService.translate(
          value.system,
          value.code,
          targetSystem
        );
        
        if (translations.length > 0) {
          const translation = translations[0];
          return {
            system: translation.system || targetSystem,
            code: translation.code,
            display: translation.display
          };
        }
      } else if (typeof value === 'string') {
        // Handle string code input
        const translations = this.conceptMapService.translate(
          sourceSystem,
          value,
          targetSystem
        );
        
        if (translations.length > 0) {
          return translations[0].code;
        }
      }
    } catch (error) {
      console.error('Error in translate transform:', error);
    }
    
    return value;
  }

  /**
   * Basic FHIRPath evaluation
   */
  private evaluateFhirPath(value: any, parameters?: any[]): any {
    if (!parameters || parameters.length === 0) {
      return value;
    }
    
    const expression = parameters[0];
    
    // Very basic FHIRPath implementation - would need proper parser in production
    if (expression === 'true') return true;
    if (expression === 'false') return false;
    if (expression.startsWith("'") && expression.endsWith("'")) {
      return expression.slice(1, -1);
    }
    
    // Handle simple property access
    if (expression.includes('.')) {
      const parts = expression.split('.');
      let current = value;
      for (const part of parts) {
        if (current && typeof current === 'object') {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current;
    }
    
    return value;
  }

  /**
   * Create a new resource or element
   */
  private createResource(parameters?: any[]): any {
    if (!parameters || parameters.length === 0) {
      return {};
    }
    
    const resourceType = parameters[0];
    return { resourceType };
  }

  /**
   * Create a reference
   */
  private createReference(value: any, parameters?: any[]): any {
    if (typeof value === 'string') {
      return { reference: value };
    }
    
    if (value && value.resourceType && value.id) {
      return { reference: `${value.resourceType}/${value.id}` };
    }
    
    return value;
  }

  /**
   * Apply date operations
   */
  private applyDateOperation(value: any, parameters?: any[]): any {
    if (!parameters || parameters.length < 2) {
      return value;
    }
    
    const operation = parameters[0];
    const amount = parameters[1];
    
    try {
      const date = new Date(value);
      
      switch (operation) {
        case 'add':
          return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000).toISOString();
        case 'subtract':
          return new Date(date.getTime() - amount * 24 * 60 * 60 * 1000).toISOString();
        case 'now':
          return new Date().toISOString();
        default:
          return value;
      }
    } catch (error) {
      return value;
    }
  }

  /**
   * Append strings
   */
  private appendStrings(value: any, parameters?: any[]): any {
    if (!parameters || parameters.length === 0) {
      return value;
    }
    
    let result = String(value || '');
    for (const param of parameters) {
      result += String(param);
    }
    
    return result;
  }

  /**
   * Cast value to different type
   */
  private castValue(value: any, parameters?: any[]): any {
    if (!parameters || parameters.length === 0) {
      return value;
    }
    
    const targetType = parameters[0];
    
    try {
      switch (targetType) {
        case 'string':
          return String(value);
        case 'integer':
          return parseInt(value, 10);
        case 'decimal':
          return parseFloat(value);
        case 'boolean':
          return Boolean(value);
        case 'date':
          return new Date(value).toISOString().split('T')[0];
        case 'dateTime':
          return new Date(value).toISOString();
        default:
          return value;
      }
    } catch (error) {
      return value;
    }
  }

  /**
   * Get terminology services for external access
   */
  getTerminologyServices(): {
    conceptMapService?: ConceptMapService;
    valueSetService?: ValueSetService;
    codeSystemService?: CodeSystemService;
  } {
    return {
      conceptMapService: this.conceptMapService,
      valueSetService: this.valueSetService,
      codeSystemService: this.codeSystemService
    };
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