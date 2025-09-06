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
}