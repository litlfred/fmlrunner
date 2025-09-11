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

/**
 * FHIR ConceptMap resource for terminology mapping
 */
export interface ConceptMap {
  resourceType: 'ConceptMap';
  id?: string;
  url?: string;
  identifier?: Identifier[];
  version?: string;
  name?: string;
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
  sourceUri?: string;
  sourceCanonical?: string;
  targetUri?: string;
  targetCanonical?: string;
  group?: ConceptMapGroup[];
}

export interface ConceptMapGroup {
  source?: string;
  sourceVersion?: string;
  target?: string;
  targetVersion?: string;
  element: ConceptMapGroupElement[];
  unmapped?: ConceptMapGroupUnmapped;
}

export interface ConceptMapGroupElement {
  code?: string;
  display?: string;
  target?: ConceptMapGroupElementTarget[];
}

export interface ConceptMapGroupElementTarget {
  code?: string;
  display?: string;
  equivalence: 'relatedto' | 'equivalent' | 'equal' | 'wider' | 'subsumes' | 'narrower' | 'specializes' | 'inexact' | 'unmatched' | 'disjoint';
  comment?: string;
  dependsOn?: ConceptMapGroupElementTargetDependsOn[];
  product?: ConceptMapGroupElementTargetDependsOn[];
}

export interface ConceptMapGroupElementTargetDependsOn {
  property: string;
  system?: string;
  value: string;
  display?: string;
}

export interface ConceptMapGroupUnmapped {
  mode: 'provided' | 'fixed' | 'other-map';
  code?: string;
  display?: string;
  url?: string;
}

/**
 * FHIR ValueSet resource for terminology sets
 */
export interface ValueSet {
  resourceType: 'ValueSet';
  id?: string;
  url?: string;
  identifier?: Identifier[];
  version?: string;
  name?: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  date?: string;
  publisher?: string;
  contact?: ContactDetail[];
  description?: string;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  immutable?: boolean;
  purpose?: string;
  copyright?: string;
  compose?: ValueSetCompose;
  expansion?: ValueSetExpansion;
}

export interface ValueSetCompose {
  lockedDate?: string;
  inactive?: boolean;
  include: ValueSetComposeInclude[];
  exclude?: ValueSetComposeInclude[];
}

export interface ValueSetComposeInclude {
  system?: string;
  version?: string;
  concept?: ValueSetComposeIncludeConcept[];
  filter?: ValueSetComposeIncludeFilter[];
  valueSet?: string[];
}

export interface ValueSetComposeIncludeConcept {
  code: string;
  display?: string;
  designation?: ValueSetComposeIncludeConceptDesignation[];
}

export interface ValueSetComposeIncludeConceptDesignation {
  language?: string;
  use?: Coding;
  value: string;
}

export interface ValueSetComposeIncludeFilter {
  property: string;
  op: 'equals' | 'is-a' | 'descendent-of' | 'is-not-a' | 'regex' | 'in' | 'not-in' | 'generalizes' | 'exists';
  value: string;
}

export interface ValueSetExpansion {
  identifier?: string;
  timestamp: string;
  total?: number;
  offset?: number;
  parameter?: ValueSetExpansionParameter[];
  contains?: ValueSetExpansionContains[];
}

export interface ValueSetExpansionParameter {
  name: string;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueDecimal?: number;
  valueUri?: string;
  valueCode?: string;
  valueDateTime?: string;
}

export interface ValueSetExpansionContains {
  system?: string;
  abstract?: boolean;
  inactive?: boolean;
  version?: string;
  code?: string;
  display?: string;
  designation?: ValueSetComposeIncludeConceptDesignation[];
  contains?: ValueSetExpansionContains[];
}

/**
 * FHIR CodeSystem resource for terminology definitions
 */
export interface CodeSystem {
  resourceType: 'CodeSystem';
  id?: string;
  url?: string;
  identifier?: Identifier[];
  version?: string;
  name?: string;
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
  caseSensitive?: boolean;
  valueSet?: string;
  hierarchyMeaning?: 'grouped-by' | 'is-a' | 'part-of' | 'classified-with';
  compositional?: boolean;
  versionNeeded?: boolean;
  content: 'not-present' | 'example' | 'fragment' | 'complete' | 'supplement';
  supplements?: string;
  count?: number;
  filter?: CodeSystemFilter[];
  property?: CodeSystemProperty[];
  concept?: CodeSystemConcept[];
}

export interface CodeSystemFilter {
  code: string;
  description?: string;
  operator: ('equals' | 'is-a' | 'descendent-of' | 'is-not-a' | 'regex' | 'in' | 'not-in' | 'generalizes' | 'exists')[];
  value: string;
}

export interface CodeSystemProperty {
  code: string;
  uri?: string;
  description?: string;
  type: 'code' | 'Coding' | 'string' | 'integer' | 'boolean' | 'dateTime' | 'decimal';
}

export interface CodeSystemConcept {
  code: string;
  display?: string;
  definition?: string;
  designation?: CodeSystemConceptDesignation[];
  property?: CodeSystemConceptProperty[];
  concept?: CodeSystemConcept[];
}

export interface CodeSystemConceptDesignation {
  language?: string;
  use?: Coding;
  value: string;
}

export interface CodeSystemConceptProperty {
  code: string;
  valueCode?: string;
  valueCoding?: Coding;
  valueString?: string;
  valueInteger?: number;
  valueBoolean?: boolean;
  valueDateTime?: string;
  valueDecimal?: number;
}

/**
 * Common FHIR data types
 */
export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: CodeableConcept;
  system?: string;
  value?: string;
  period?: Period;
  assigner?: Reference;
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

export interface Period {
  start?: string;
  end?: string;
}

export interface Reference {
  reference?: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

export interface Quantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface Range {
  low?: Quantity;
  high?: Quantity;
}

/**
 * FHIR Bundle for bulk operations
 */
export interface Bundle {
  resourceType: 'Bundle';
  id?: string;
  identifier?: Identifier;
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  timestamp?: string;
  total?: number;
  link?: BundleLink[];
  entry?: BundleEntry[];
  signature?: Signature;
}

export interface BundleLink {
  relation: string;
  url: string;
}

export interface BundleEntry {
  link?: BundleLink[];
  fullUrl?: string;
  resource?: any; // Can be any FHIR resource
  search?: BundleEntrySearch;
  request?: BundleEntryRequest;
  response?: BundleEntryResponse;
}

export interface BundleEntrySearch {
  mode?: 'match' | 'include' | 'outcome';
  score?: number;
}

export interface BundleEntryRequest {
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

export interface BundleEntryResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
  outcome?: any;
}

export interface Signature {
  type: Coding[];
  when: string;
  who: Reference;
  onBehalfOf?: Reference;
  targetFormat?: string;
  sigFormat?: string;
  data?: string;
}