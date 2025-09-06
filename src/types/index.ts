/**
 * Basic FHIR StructureMap types
 */

export interface StructureMap {
  resourceType: 'StructureMap';
  id?: string;
  url?: string;
  name?: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  description?: string;
  group: StructureMapGroup[];
}

export interface StructureMapGroup {
  name: string;
  typeMode?: 'none' | 'types' | 'type-and-types';
  documentation?: string;
  input: StructureMapGroupInput[];
  rule: StructureMapGroupRule[];
}

export interface StructureMapGroupInput {
  name: string;
  type?: string;
  mode: 'source' | 'target';
  documentation?: string;
}

export interface StructureMapGroupRule {
  name?: string;
  source: StructureMapGroupRuleSource[];
  target?: StructureMapGroupRuleTarget[];
  documentation?: string;
}

export interface StructureMapGroupRuleSource {
  context: string;
  element?: string;
  variable?: string;
  type?: string;
  min?: number;
  max?: string;
}

export interface StructureMapGroupRuleTarget {
  context?: string;
  contextType?: 'variable' | 'type';
  element?: string;
  variable?: string;
  transform?: string;
  parameter?: any[];
}

/**
 * FML compilation result
 */
export interface FmlCompilationResult {
  success: boolean;
  structureMap?: StructureMap;
  errors?: string[];
}

/**
 * StructureMap execution result
 */
export interface ExecutionResult {
  success: boolean;
  result?: any;
  errors?: string[];
}

/**
 * Configuration options
 */
export interface FmlRunnerOptions {
  baseUrl?: string;
  cacheEnabled?: boolean;
  timeout?: number;
  strictMode?: boolean; // New: Enable strict validation mode
}

/**
 * FHIR StructureDefinition for logical models and validation
 */
export interface StructureDefinition {
  resourceType: 'StructureDefinition';
  id?: string;
  url?: string;
  name?: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  kind: 'primitive-type' | 'complex-type' | 'resource' | 'logical';
  abstract?: boolean;
  type: string;
  baseDefinition?: string;
  derivation?: 'specialization' | 'constraint';
  snapshot?: StructureDefinitionSnapshot;
  differential?: StructureDefinitionDifferential;
}

export interface StructureDefinitionSnapshot {
  element: ElementDefinition[];
}

export interface StructureDefinitionDifferential {
  element: ElementDefinition[];
}

export interface ElementDefinition {
  id?: string;
  path: string;
  sliceName?: string;
  min?: number;
  max?: string;
  type?: ElementDefinitionType[];
  binding?: ElementDefinitionBinding;
}

export interface ElementDefinitionType {
  code: string;
  profile?: string[];
}

export interface ElementDefinitionBinding {
  strength?: 'required' | 'extensible' | 'preferred' | 'example';
  valueSet?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  path: string;
  message: string;
  severity: 'warning';
}

/**
 * Enhanced execution options with validation
 */
export interface ExecutionOptions {
  strictMode?: boolean;
  validateInput?: boolean;
  validateOutput?: boolean;
  inputProfile?: string;
  outputProfile?: string;
}

/**
 * Enhanced execution result with validation details
 */
export interface EnhancedExecutionResult extends ExecutionResult {
  validation?: {
    input?: ValidationResult;
    output?: ValidationResult;
  };
}