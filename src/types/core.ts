/**
 * Core FML Runner Type Definitions
 * 
 * This file contains the main type definitions for the FML Runner library.
 * These types are used throughout the application for type safety and will be used
 * to generate JSON schemas for runtime validation.
 */

// ============================================================================
// FHIR STRUCTURE DEFINITION TYPES
// ============================================================================

/**
 * FHIR StructureDefinition resource for logical models and profiles
 */
export interface StructureDefinition {
  resourceType: 'StructureDefinition';
  id?: string;
  url: string;
  version?: string;
  name: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  date?: string;
  publisher?: string;
  contact?: ContactDetail[];
  description?: string;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: string;
  copyright?: string;
  keyword?: Coding[];
  fhirVersion?: string;
  mapping?: StructureDefinitionMapping[];
  kind: 'primitive-type' | 'complex-type' | 'resource' | 'logical';
  abstract: boolean;
  context?: StructureDefinitionContext[];
  contextInvariant?: string[];
  type: string;
  baseDefinition?: string;
  derivation?: 'specialization' | 'constraint';
  snapshot?: StructureDefinitionSnapshot;
  differential?: StructureDefinitionDifferential;
}

export interface ContactDetail {
  name?: string;
  telecom?: ContactPoint[];
}

export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: Period;
}

export interface Period {
  start?: string;
  end?: string;
}

export interface UsageContext {
  code: Coding;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueReference?: Reference;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface Quantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>' | 'ad';
  unit?: string;
  system?: string;
  code?: string;
}

export interface Range {
  low?: Quantity;
  high?: Quantity;
}

export interface Reference {
  reference?: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: CodeableConcept;
  system?: string;
  value?: string;
  period?: Period;
  assigner?: Reference;
}

export interface StructureDefinitionMapping {
  identity: string;
  uri?: string;
  name?: string;
  comment?: string;
}

export interface StructureDefinitionContext {
  type: 'fhirpath' | 'element' | 'extension';
  expression: string;
}

export interface StructureDefinitionSnapshot {
  element: ElementDefinition[];
}

export interface StructureDefinitionDifferential {
  element: ElementDefinition[];
}

export interface ElementDefinition {
  id?: string;
  extension?: Extension[];
  modifierExtension?: Extension[];
  path: string;
  representation?: ('xmlAttr' | 'xmlText' | 'typeAttr' | 'cdaText' | 'xhtml')[];
  sliceName?: string;
  sliceIsConstraining?: boolean;
  label?: string;
  code?: Coding[];
  slicing?: ElementDefinitionSlicing;
  short?: string;
  definition?: string;
  comment?: string;
  requirements?: string;
  alias?: string[];
  min?: number;
  max?: string;
  base?: ElementDefinitionBase;
  contentReference?: string;
  type?: ElementDefinitionType[];
  defaultValueBase64Binary?: string;
  defaultValueBoolean?: boolean;
  defaultValueCanonical?: string;
  defaultValueCode?: string;
  defaultValueDate?: string;
  defaultValueDateTime?: string;
  defaultValueDecimal?: number;
  defaultValueId?: string;
  defaultValueInstant?: string;
  defaultValueInteger?: number;
  defaultValueMarkdown?: string;
  defaultValueOid?: string;
  defaultValuePositiveInt?: number;
  defaultValueString?: string;
  defaultValueTime?: string;
  defaultValueUnsignedInt?: number;
  defaultValueUri?: string;
  defaultValueUrl?: string;
  defaultValueUuid?: string;
  defaultValueAddress?: any;
  defaultValueAge?: any;
  defaultValueAnnotation?: any;
  defaultValueAttachment?: any;
  defaultValueCodeableConcept?: CodeableConcept;
  defaultValueCoding?: Coding;
  defaultValueContactPoint?: ContactPoint;
  defaultValueCount?: any;
  defaultValueDistance?: any;
  defaultValueDuration?: any;
  defaultValueHumanName?: any;
  defaultValueIdentifier?: Identifier;
  defaultValueMoney?: any;
  defaultValuePeriod?: Period;
  defaultValueQuantity?: Quantity;
  defaultValueRange?: Range;
  defaultValueRatio?: any;
  defaultValueReference?: Reference;
  defaultValueSampledData?: any;
  defaultValueSignature?: any;
  defaultValueTiming?: any;
  defaultValueContactDetail?: ContactDetail;
  defaultValueContributor?: any;
  defaultValueDataRequirement?: any;
  defaultValueExpression?: any;
  defaultValueParameterDefinition?: any;
  defaultValueRelatedArtifact?: any;
  defaultValueTriggerDefinition?: any;
  defaultValueUsageContext?: UsageContext;
  defaultValueDosage?: any;
  meaningWhenMissing?: string;
  orderMeaning?: string;
  fixedBase64Binary?: string;
  fixedBoolean?: boolean;
  fixedCanonical?: string;
  fixedCode?: string;
  fixedDate?: string;
  fixedDateTime?: string;
  fixedDecimal?: number;
  fixedId?: string;
  fixedInstant?: string;
  fixedInteger?: number;
  fixedMarkdown?: string;
  fixedOid?: string;
  fixedPositiveInt?: number;
  fixedString?: string;
  fixedTime?: string;
  fixedUnsignedInt?: number;
  fixedUri?: string;
  fixedUrl?: string;
  fixedUuid?: string;
  fixedAddress?: any;
  fixedAge?: any;
  fixedAnnotation?: any;
  fixedAttachment?: any;
  fixedCodeableConcept?: CodeableConcept;
  fixedCoding?: Coding;
  fixedContactPoint?: ContactPoint;
  fixedCount?: any;
  fixedDistance?: any;
  fixedDuration?: any;
  fixedHumanName?: any;
  fixedIdentifier?: Identifier;
  fixedMoney?: any;
  fixedPeriod?: Period;
  fixedQuantity?: Quantity;
  fixedRange?: Range;
  fixedRatio?: any;
  fixedReference?: Reference;
  fixedSampledData?: any;
  fixedSignature?: any;
  fixedTiming?: any;
  fixedContactDetail?: ContactDetail;
  fixedContributor?: any;
  fixedDataRequirement?: any;
  fixedExpression?: any;
  fixedParameterDefinition?: any;
  fixedRelatedArtifact?: any;
  fixedTriggerDefinition?: any;
  fixedUsageContext?: UsageContext;
  fixedDosage?: any;
  patternBase64Binary?: string;
  patternBoolean?: boolean;
  patternCanonical?: string;
  patternCode?: string;
  patternDate?: string;
  patternDateTime?: string;
  patternDecimal?: number;
  patternId?: string;
  patternInstant?: string;
  patternInteger?: number;
  patternMarkdown?: string;
  patternOid?: string;
  patternPositiveInt?: number;
  patternString?: string;
  patternTime?: string;
  patternUnsignedInt?: number;
  patternUri?: string;
  patternUrl?: string;
  patternUuid?: string;
  patternAddress?: any;
  patternAge?: any;
  patternAnnotation?: any;
  patternAttachment?: any;
  patternCodeableConcept?: CodeableConcept;
  patternCoding?: Coding;
  patternContactPoint?: ContactPoint;
  patternCount?: any;
  patternDistance?: any;
  patternDuration?: any;
  patternHumanName?: any;
  patternIdentifier?: Identifier;
  patternMoney?: any;
  patternPeriod?: Period;
  patternQuantity?: Quantity;
  patternRange?: Range;
  patternRatio?: any;
  patternReference?: Reference;
  patternSampledData?: any;
  patternSignature?: any;
  patternTiming?: any;
  patternContactDetail?: ContactDetail;
  patternContributor?: any;
  patternDataRequirement?: any;
  patternExpression?: any;
  patternParameterDefinition?: any;
  patternRelatedArtifact?: any;
  patternTriggerDefinition?: any;
  patternUsageContext?: UsageContext;
  patternDosage?: any;
  example?: ElementDefinitionExample[];
  minValueDate?: string;
  minValueDateTime?: string;
  minValueInstant?: string;
  minValueTime?: string;
  minValueDecimal?: number;
  minValueInteger?: number;
  minValuePositiveInt?: number;
  minValueUnsignedInt?: number;
  minValueQuantity?: Quantity;
  maxValueDate?: string;
  maxValueDateTime?: string;
  maxValueInstant?: string;
  maxValueTime?: string;
  maxValueDecimal?: number;
  maxValueInteger?: number;
  maxValuePositiveInt?: number;
  maxValueUnsignedInt?: number;
  maxValueQuantity?: Quantity;
  maxLength?: number;
  condition?: string[];
  constraint?: ElementDefinitionConstraint[];
  mustSupport?: boolean;
  isModifier?: boolean;
  isModifierReason?: string;
  isSummary?: boolean;
  binding?: ElementDefinitionBinding;
  mapping?: ElementDefinitionMapping[];
}

export interface Extension {
  url: string;
  valueBase64Binary?: string;
  valueBoolean?: boolean;
  valueCanonical?: string;
  valueCode?: string;
  valueDate?: string;
  valueDateTime?: string;
  valueDecimal?: number;
  valueId?: string;
  valueInstant?: string;
  valueInteger?: number;
  valueMarkdown?: string;
  valueOid?: string;
  valuePositiveInt?: number;
  valueString?: string;
  valueTime?: string;
  valueUnsignedInt?: number;
  valueUri?: string;
  valueUrl?: string;
  valueUuid?: string;
  valueAddress?: any;
  valueAge?: any;
  valueAnnotation?: any;
  valueAttachment?: any;
  valueCodeableConcept?: CodeableConcept;
  valueCoding?: Coding;
  valueContactPoint?: ContactPoint;
  valueCount?: any;
  valueDistance?: any;
  valueDuration?: any;
  valueHumanName?: any;
  valueIdentifier?: Identifier;
  valueMoney?: any;
  valuePeriod?: Period;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueRatio?: any;
  valueReference?: Reference;
  valueSampledData?: any;
  valueSignature?: any;
  valueTiming?: any;
  valueContactDetail?: ContactDetail;
  valueContributor?: any;
  valueDataRequirement?: any;
  valueExpression?: any;
  valueParameterDefinition?: any;
  valueRelatedArtifact?: any;
  valueTriggerDefinition?: any;
  valueUsageContext?: UsageContext;
  valueDosage?: any;
}

export interface ElementDefinitionSlicing {
  discriminator?: ElementDefinitionSlicingDiscriminator[];
  description?: string;
  ordered?: boolean;
  rules: 'closed' | 'open' | 'openAtEnd';
}

export interface ElementDefinitionSlicingDiscriminator {
  type: 'value' | 'exists' | 'pattern' | 'type' | 'profile';
  path: string;
}

export interface ElementDefinitionBase {
  path: string;
  min: number;
  max: string;
}

export interface ElementDefinitionType {
  code: string;
  profile?: string[];
  targetProfile?: string[];
  aggregation?: ('contained' | 'referenced' | 'bundled')[];
  versioning?: 'either' | 'independent' | 'specific';
}

export interface ElementDefinitionExample {
  label: string;
  valueBase64Binary?: string;
  valueBoolean?: boolean;
  valueCanonical?: string;
  valueCode?: string;
  valueDate?: string;
  valueDateTime?: string;
  valueDecimal?: number;
  valueId?: string;
  valueInstant?: string;
  valueInteger?: number;
  valueMarkdown?: string;
  valueOid?: string;
  valuePositiveInt?: number;
  valueString?: string;
  valueTime?: string;
  valueUnsignedInt?: number;
  valueUri?: string;
  valueUrl?: string;
  valueUuid?: string;
  valueAddress?: any;
  valueAge?: any;
  valueAnnotation?: any;
  valueAttachment?: any;
  valueCodeableConcept?: CodeableConcept;
  valueCoding?: Coding;
  valueContactPoint?: ContactPoint;
  valueCount?: any;
  valueDistance?: any;
  valueDuration?: any;
  valueHumanName?: any;
  valueIdentifier?: Identifier;
  valueMoney?: any;
  valuePeriod?: Period;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueRatio?: any;
  valueReference?: Reference;
  valueSampledData?: any;
  valueSignature?: any;
  valueTiming?: any;
  valueContactDetail?: ContactDetail;
  valueContributor?: any;
  valueDataRequirement?: any;
  valueExpression?: any;
  valueParameterDefinition?: any;
  valueRelatedArtifact?: any;
  valueTriggerDefinition?: any;
  valueUsageContext?: UsageContext;
  valueDosage?: any;
}

export interface ElementDefinitionConstraint {
  key: string;
  requirements?: string;
  severity: 'error' | 'warning';
  human: string;
  expression?: string;
  xpath?: string;
  source?: string;
}

export interface ElementDefinitionBinding {
  strength: 'required' | 'extensible' | 'preferred' | 'example';
  description?: string;
  valueSet?: string;
}

export interface ElementDefinitionMapping {
  identity: string;
  language?: string;
  map: string;
  comment?: string;
}

// ============================================================================
// VALIDATION FRAMEWORK TYPES
// ============================================================================

/**
 * Validation rule for data validation
 */
export interface ValidationRule<T = any> {
  name: string;
  description: string;
  validator: (data: T) => ValidationResult;
  schema?: any; // JSON Schema
}

/**
 * Result of validation operation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  value?: any;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  value?: any;
}

// ============================================================================
// RUNTIME VALIDATION SERVICE TYPES
// ============================================================================

/**
 * Configuration for runtime validation
 */
export interface RuntimeValidationConfig {
  strict: boolean;
  throwOnError: boolean;
  coerceTypes: boolean;
  removeAdditional: boolean;
}

/**
 * Result of validated data with type safety
 */
export interface ValidatedData<T> {
  data: T;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// ============================================================================
// EXECUTION MODES
// ============================================================================

/**
 * Execution mode for StructureMap transformations
 */
export type ExecutionMode = 'strict' | 'non-strict';

/**
 * Execution options for transformations
 */
export interface ExecutionOptions {
  mode: ExecutionMode;
  validateInput?: boolean;
  validateOutput?: boolean;
  logicalModels?: StructureDefinition[];
  stopOnError?: boolean;
  maxErrors?: number;
}

/**
 * Enhanced execution result with validation information
 */
export interface EnhancedExecutionResult {
  result?: any;
  isSuccess: boolean;
  validationResult?: {
    input?: ValidationResult;
    output?: ValidationResult;
  };
  errors: ValidationError[];
  warnings: ValidationWarning[];
  logs?: ExecutionLog[];
  performance?: PerformanceMetrics;
}

/**
 * Execution log entry
 */
export interface ExecutionLog {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
  context?: any;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  executionTime: number;
  memoryUsed: number;
  validationTime?: number;
  transformationCount: number;
}

// ============================================================================
// LOGICAL MODEL MANAGEMENT TYPES
// ============================================================================

/**
 * Information about a logical model
 */
export interface LogicalModelInfo {
  id: string;
  url: string;
  name: string;
  version?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  kind: 'logical' | 'resource' | 'complex-type' | 'primitive-type';
  description?: string;
  lastModified?: string;
  size?: number;
  source: 'directory' | 'url' | 'cache';
}

/**
 * Request for creating/updating logical models
 */
export interface LogicalModelUploadRequest {
  type: 'structureDefinition';
  content: StructureDefinition;
  options?: {
    validate?: boolean;
    strictMode?: boolean;
  };
  metadata?: {
    description?: string;
    author?: string;
    tags?: string[];
    experimental?: boolean;
  };
}

/**
 * Response from creating logical models
 */
export interface LogicalModelCreateResponse {
  id: string;
  url: string;
  version?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  createdAt: string;
  location: string;
  validationInfo?: {
    wasValidated: boolean;
    validationTime?: number;
    warnings?: ValidationWarning[];
  };
}

/**
 * Response from updating logical models
 */
export interface LogicalModelUpdateResponse {
  id: string;
  url: string;
  version?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  updatedAt: string;
  previousVersion?: string;
  validationInfo?: {
    wasValidated: boolean;
    validationTime?: number;
    warnings?: ValidationWarning[];
  };
  changesSummary?: {
    elementChanges: boolean;
    typeChanges: boolean;
    constraintChanges: boolean;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AsyncResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}>;

export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

export type PaginatedResponse<T> = ServiceResponse<{
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}>;