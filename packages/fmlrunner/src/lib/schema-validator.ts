import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from './logger';
import { StructureMap, StructureDefinition, ConceptMap, ValueSet, CodeSystem, Bundle } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Schema validator for JSON schema validation of input/output parameters
 */
export class SchemaValidator {
  private ajv: Ajv;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(this.ajv);
    
    // Load schemas
    this.loadSchemas();
  }

  private loadSchemas(): void {
    // FML Input Schema
    const fmlInputSchema: JSONSchemaType<string> = {
      type: 'string',
      minLength: 1,
      pattern: '^map\\s+'
    };
    this.ajv.addSchema(fmlInputSchema, 'fml-input');

    // StructureMap Schema (simplified)
    const structureMapSchema = {
      type: 'object',
      properties: {
        resourceType: { type: 'string', const: 'StructureMap' },
        id: { type: 'string' },
        url: { type: 'string', format: 'uri' },
        name: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'active', 'retired', 'unknown'] }
      },
      required: ['resourceType'],
      additionalProperties: true
    };
    this.ajv.addSchema(structureMapSchema, 'structure-map');

    // Bundle Schema
    const bundleSchema = {
      type: 'object',
      properties: {
        resourceType: { type: 'string', const: 'Bundle' },
        id: { type: 'string' },
        type: { type: 'string' },
        entry: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              resource: { type: 'object' }
            }
          }
        }
      },
      required: ['resourceType'],
      additionalProperties: true
    };
    this.ajv.addSchema(bundleSchema, 'bundle');

    // Execution Input Schema
    const executionInputSchema = {
      oneOf: [
        { type: 'object' },
        { type: 'array' },
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' }
      ]
    };
    this.ajv.addSchema(executionInputSchema, 'execution-input');

    // StructureDefinition Schema
    const structureDefinitionSchema = {
      type: 'object',
      properties: {
        resourceType: { type: 'string', const: 'StructureDefinition' },
        id: { type: 'string' },
        url: { type: 'string', format: 'uri' },
        name: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'active', 'retired', 'unknown'] }
      },
      required: ['resourceType'],
      additionalProperties: true
    };
    this.ajv.addSchema(structureDefinitionSchema, 'structure-definition');
  }

  /**
   * Validate FML input content
   */
  validateFmlInput(fmlContent: string): ValidationResult {
    const validate = this.ajv.getSchema('fml-input');
    if (!validate) {
      return { valid: false, errors: ['FML input schema not found'] };
    }

    const valid = validate(fmlContent);
    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors = validate.errors?.map(err => 
      `${err.instancePath}: ${err.message}`
    ) || ['Unknown validation error'];

    this.logger.debug('FML input validation failed', { errors });
    return { valid: false, errors };
  }

  /**
   * Validate StructureMap output
   */
  validateStructureMapOutput(structureMap: StructureMap): ValidationResult {
    const validate = this.ajv.getSchema('structure-map');
    if (!validate) {
      return { valid: false, errors: ['StructureMap schema not found'] };
    }

    const valid = validate(structureMap);
    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors = validate.errors?.map(err => 
      `${err.instancePath}: ${err.message}`
    ) || ['Unknown validation error'];

    this.logger.debug('StructureMap validation failed', { errors });
    return { valid: false, errors };
  }

  /**
   * Validate execution input
   */
  validateExecutionInput(input: any): ValidationResult {
    const validate = this.ajv.getSchema('execution-input');
    if (!validate) {
      return { valid: false, errors: ['Execution input schema not found'] };
    }

    const valid = validate(input);
    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors = validate.errors?.map(err => 
      `${err.instancePath}: ${err.message}`
    ) || ['Unknown validation error'];

    this.logger.debug('Execution input validation failed', { errors });
    return { valid: false, errors };
  }

  /**
   * Validate execution output
   */
  validateExecutionOutput(output: any): ValidationResult {
    // For now, accept any output format
    // Could be enhanced with specific FHIR resource schemas
    if (output === null || output === undefined) {
      return { valid: false, errors: ['Output cannot be null or undefined'] };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate Bundle resource
   */
  validateBundle(bundle: Bundle): ValidationResult {
    const validate = this.ajv.getSchema('bundle');
    if (!validate) {
      return { valid: false, errors: ['Bundle schema not found'] };
    }

    const valid = validate(bundle);
    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors = validate.errors?.map(err => 
      `${err.instancePath}: ${err.message}`
    ) || ['Unknown validation error'];

    this.logger.debug('Bundle validation failed', { errors });
    return { valid: false, errors };
  }

  /**
   * Validate StructureDefinition resource
   */
  validateStructureDefinition(structureDefinition: StructureDefinition): ValidationResult {
    const validate = this.ajv.getSchema('structure-definition');
    if (!validate) {
      return { valid: false, errors: ['StructureDefinition schema not found'] };
    }

    const valid = validate(structureDefinition);
    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors = validate.errors?.map(err => 
      `${err.instancePath}: ${err.message}`
    ) || ['Unknown validation error'];

    this.logger.debug('StructureDefinition validation failed', { errors });
    return { valid: false, errors };
  }

  /**
   * Add custom schema
   */
  addSchema(schema: any, key: string): void {
    this.ajv.addSchema(schema, key);
    this.logger.debug('Custom schema added', { key });
  }

  /**
   * Validate against custom schema
   */
  validateCustom(data: any, schemaKey: string): ValidationResult {
    const validate = this.ajv.getSchema(schemaKey);
    if (!validate) {
      return { valid: false, errors: [`Schema '${schemaKey}' not found`] };
    }

    const valid = validate(data);
    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors = validate.errors?.map(err => 
      `${err.instancePath}: ${err.message}`
    ) || ['Unknown validation error'];

    this.logger.debug('Custom validation failed', { schemaKey, errors });
    return { valid: false, errors };
  }
}