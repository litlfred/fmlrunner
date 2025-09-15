import { FmlCompiler } from './lib/fml-compiler';
import { StructureMapRetriever } from './lib/structure-map-retriever';
import { StructureMapExecutor } from './lib/structure-map-executor';
import { ValidationService } from './lib/validation-service';
import { ConceptMapService } from './lib/conceptmap-service';
import { ValueSetService } from './lib/valueset-service';
import { CodeSystemService } from './lib/codesystem-service';
import { BundleService, BundleProcessingResult } from './lib/bundle-service';
import { Logger } from './lib/logger';
import { SchemaValidator } from './lib/schema-validator';
import { 
  StructureMap, 
  FmlCompilationResult, 
  FmlSyntaxValidationResult,
  ExecutionResult, 
  EnhancedExecutionResult,
  ExecutionOptions,
  FmlRunnerOptions,
  StructureDefinition,
  ConceptMap,
  ValueSet,
  CodeSystem,
  Bundle
} from './types';

/**
 * Main FmlRunner class providing FML compilation and StructureMap execution
 * with JSON schema validation and comprehensive logging
 */
export class FmlRunner {
  private compiler: FmlCompiler;
  private retriever: StructureMapRetriever;
  private executor: StructureMapExecutor;
  private conceptMapService: ConceptMapService;
  private valueSetService: ValueSetService;
  private codeSystemService: CodeSystemService;
  private bundleService: BundleService;
  private schemaValidator: SchemaValidator;
  private logger: Logger;
  private structureMapStore: Map<string, StructureMap> = new Map();
  private options: FmlRunnerOptions;

  constructor(options: FmlRunnerOptions = {}) {
    this.options = {
      cacheEnabled: true,
      timeout: 5000,
      strictMode: false,
      validateInputOutput: true,
      ...options
    };

    this.logger = new Logger('FmlRunner', this.options.logLevel);
    this.schemaValidator = new SchemaValidator(this.logger);
    
    this.compiler = new FmlCompiler(this.logger);
    this.retriever = new StructureMapRetriever(this.logger);
    this.executor = new StructureMapExecutor(this.logger);
    this.conceptMapService = new ConceptMapService(this.logger);
    this.valueSetService = new ValueSetService(this.logger);
    this.codeSystemService = new CodeSystemService(this.logger);
    
    // Create bundle service with references to all resource services
    this.bundleService = new BundleService(
      this.conceptMapService,
      this.valueSetService,
      this.codeSystemService,
      this.executor.getValidationService(),
      this.structureMapStore,
      this.logger
    );

    // Set base URL for retriever if provided
    if (options.baseUrl) {
      this.retriever.setBaseDirectory(options.baseUrl);
    }

    // Enhance executor with terminology services
    this.executor.setTerminologyServices(
      this.conceptMapService,
      this.valueSetService,
      this.codeSystemService
    );

    this.logger.info('FmlRunner initialized', { options: this.options });
  }

  /**
   * Compile FML content to StructureMap with input validation
   */
  compileFml(fmlContent: string): FmlCompilationResult {
    this.logger.debug('Compiling FML content', { contentLength: fmlContent.length });
    
    if (this.options.validateInputOutput) {
      const validation = this.schemaValidator.validateFmlInput(fmlContent);
      if (!validation.valid) {
        this.logger.error('FML input validation failed', { errors: validation.errors });
        return {
          success: false,
          errors: validation.errors
        };
      }
    }

    const result = this.compiler.compile(fmlContent);
    
    if (this.options.validateInputOutput && result.success && result.structureMap) {
      const validation = this.schemaValidator.validateStructureMapOutput(result.structureMap);
      if (!validation.valid) {
        this.logger.error('StructureMap output validation failed', { errors: validation.errors });
        return {
          success: false,
          errors: validation.errors
        };
      }
    }

    this.logger.info('FML compilation completed', { 
      success: result.success, 
      errorCount: result.errors?.length || 0 
    });
    
    return result;
  }

  /**
   * Validate FML syntax without generating StructureMap
   */
  validateFmlSyntax(fmlContent: string): FmlSyntaxValidationResult {
    this.logger.debug('Validating FML syntax', { contentLength: fmlContent.length });
    
    const result = this.compiler.validateSyntax(fmlContent);
    
    this.logger.info('FML syntax validation completed', { 
      success: result.success, 
      valid: result.valid,
      errorCount: result.errors?.length || 0 
    });
    
    return result;
  }

  /**
   * Execute StructureMap on input content with validation
   */
  async executeStructureMap(structureMapReference: string, inputContent: any): Promise<ExecutionResult> {
    this.logger.debug('Executing StructureMap', { reference: structureMapReference });
    
    if (this.options.validateInputOutput) {
      const validation = this.schemaValidator.validateExecutionInput(inputContent);
      if (!validation.valid) {
        this.logger.error('Execution input validation failed', { errors: validation.errors });
        return {
          success: false,
          errors: validation.errors
        };
      }
    }

    try {
      // Retrieve the StructureMap
      const structureMap = await this.retriever.getStructureMap(structureMapReference);
      
      if (!structureMap) {
        const error = `StructureMap not found: ${structureMapReference}`;
        this.logger.error(error);
        return {
          success: false,
          errors: [error]
        };
      }

      // Validate the StructureMap
      const validation = this.executor.validateStructureMap(structureMap);
      if (!validation.valid) {
        const error = `Invalid StructureMap: ${validation.errors.join(', ')}`;
        this.logger.error(error);
        return {
          success: false,
          errors: [error]
        };
      }

      // Execute the transformation
      const result = this.executor.execute(structureMap, inputContent);
      
      if (this.options.validateInputOutput && result.success && result.result) {
        const validation = this.schemaValidator.validateExecutionOutput(result.result);
        if (!validation.valid) {
          this.logger.error('Execution output validation failed', { errors: validation.errors });
          return {
            success: false,
            errors: validation.errors
          };
        }
      }

      this.logger.info('StructureMap execution completed', { 
        success: result.success,
        reference: structureMapReference
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
      this.logger.error('StructureMap execution failed', { error: errorMessage });
      return {
        success: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Execute StructureMap with validation support
   */
  async executeStructureMapWithValidation(
    structureMapReference: string, 
    inputContent: any,
    options?: ExecutionOptions
  ): Promise<EnhancedExecutionResult> {
    this.logger.debug('Executing StructureMap with validation', { 
      reference: structureMapReference,
      options 
    });
    
    try {
      // Retrieve the StructureMap
      const structureMap = await this.retriever.getStructureMap(structureMapReference);
      
      if (!structureMap) {
        const error = `StructureMap not found: ${structureMapReference}`;
        this.logger.error(error);
        return {
          success: false,
          errors: [error]
        };
      }

      // Validate the StructureMap
      const validation = this.executor.validateStructureMap(structureMap);
      if (!validation.valid) {
        const error = `Invalid StructureMap: ${validation.errors.join(', ')}`;
        this.logger.error(error);
        return {
          success: false,
          errors: [error]
        };
      }

      // Execute the transformation with validation
      const mergedOptions = {
        strictMode: this.options.strictMode,
        ...options
      };
      
      const result = this.executor.execute(structureMap, inputContent, mergedOptions);
      
      this.logger.info('StructureMap execution with validation completed', { 
        success: result.success,
        reference: structureMapReference
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
      this.logger.error('StructureMap execution with validation failed', { error: errorMessage });
      return {
        success: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Register a StructureDefinition for validation
   */
  registerStructureDefinition(structureDefinition: StructureDefinition): void {
    this.logger.debug('Registering StructureDefinition', { id: structureDefinition.id });
    
    if (this.options.validateInputOutput && !this.options.disableValidation) {
      const validation = this.schemaValidator.validateStructureDefinition(structureDefinition);
      if (!validation.valid) {
        this.logger.error('StructureDefinition validation failed', { errors: validation.errors });
        if (this.options.strictMode) {
          throw new Error(`Invalid StructureDefinition: ${validation.errors.join(', ')}`);
        }
      }
    }

    const validationService = this.executor.getValidationService();
    validationService.registerStructureDefinition(structureDefinition);
    
    this.logger.info('StructureDefinition registered', { id: structureDefinition.id });
  }

  /**
   * Get the validation service
   */
  getValidationService(): ValidationService | null {
    return this.executor.getValidationService();
  }

  /**
   * Retrieve StructureMap by reference
   */
  async getStructureMap(reference: string): Promise<StructureMap | null> {
    this.logger.debug('Retrieving StructureMap', { reference });
    const result = await this.retriever.getStructureMap(reference);
    this.logger.debug('StructureMap retrieval completed', { 
      reference, 
      found: !!result 
    });
    return result;
  }

  /**
   * Clear all internal caches
   */
  clearCache(): void {
    this.logger.info('Clearing all caches');
    this.retriever.clearCache();
  }

  /**
   * Set base directory for StructureMap file loading
   */
  setBaseDirectory(directory: string): void {
    this.logger.info('Setting base directory', { directory });
    this.retriever.setBaseDirectory(directory);
  }

  // ============================================
  // LIBRARY API METHODS FOR RESOURCE MANAGEMENT
  // ============================================

  /**
   * Process a FHIR Bundle and load all resources
   */
  processBundle(bundle: Bundle): BundleProcessingResult {
    this.logger.info('Processing FHIR Bundle', { 
      entryCount: bundle.entry?.length || 0 
    });
    
    if (this.options.validateInputOutput && !this.options.disableValidation) {
      const validation = this.schemaValidator.validateBundle(bundle);
      if (!validation.valid) {
        this.logger.error('Bundle validation failed', { errors: validation.errors });
        if (this.options.strictMode) {
          return {
            success: false,
            errors: validation.errors,
            warnings: [],
            processed: {
              structureMaps: 0,
              structureDefinitions: 0,
              conceptMaps: 0,
              valueSets: 0,
              codeSystems: 0,
              other: 0
            }
          };
        }
      }
    }

    const result = this.bundleService.processBundle(bundle);
    
    this.logger.info('Bundle processing completed', {
      success: result.success,
      processed: result.processed
    });

    return result;
  }

  /**
   * Get bundle processing statistics
   */
  getBundleStats(): {
    structureMaps: number;
    structureDefinitions: number;
    conceptMaps: number;
    valueSets: number;
    codeSystems: number;
  } {
    return this.bundleService.getStats();
  }

  /**
   * Create a summary bundle of all loaded resources
   */
  createResourceSummaryBundle(): Bundle {
    return this.bundleService.createSummaryBundle();
  }

  /**
   * Clear all loaded resources
   */
  clearAllResources(): void {
    this.logger.info('Clearing all loaded resources');
    this.bundleService.clearAll();
  }

  // ============================================
  // CONCEPTMAP LIBRARY API METHODS
  // ============================================

  /**
   * Register a ConceptMap resource
   */
  registerConceptMap(conceptMap: ConceptMap): void {
    this.logger.debug('Registering ConceptMap', { id: conceptMap.id });
    this.conceptMapService.registerConceptMap(conceptMap);
    this.logger.info('ConceptMap registered', { id: conceptMap.id });
  }

  /**
   * Get ConceptMap by ID or URL
   */
  getConceptMap(reference: string): ConceptMap | null {
    return this.conceptMapService.getConceptMap(reference);
  }

  /**
   * Get all registered ConceptMaps
   */
  getAllConceptMaps(): ConceptMap[] {
    return this.conceptMapService.getAllConceptMaps();
  }

  /**
   * Search ConceptMaps by parameters
   */
  searchConceptMaps(params: {
    name?: string;
    status?: string;
    url?: string;
    source?: string;
    target?: string;
  }): ConceptMap[] {
    return this.conceptMapService.searchConceptMaps(params);
  }

  /**
   * Remove ConceptMap by ID or URL
   */
  removeConceptMap(reference: string): boolean {
    this.logger.debug('Removing ConceptMap', { reference });
    const result = this.conceptMapService.removeConceptMap(reference);
    this.logger.info('ConceptMap removal completed', { reference, removed: result });
    return result;
  }

  /**
   * Translate a code using loaded ConceptMaps
   */
  translateCode(
    sourceSystem: string,
    sourceCode: string,
    targetSystem?: string
  ): Array<{ system?: string; code?: string; display?: string; equivalence: string }> {
    return this.conceptMapService.translate(sourceSystem, sourceCode, targetSystem);
  }

  // ============================================
  // VALUESET LIBRARY API METHODS
  // ============================================

  /**
   * Register a ValueSet resource
   */
  registerValueSet(valueSet: ValueSet): void {
    this.logger.debug('Registering ValueSet', { id: valueSet.id });
    this.valueSetService.registerValueSet(valueSet);
    this.logger.info('ValueSet registered', { id: valueSet.id });
  }

  /**
   * Get ValueSet by ID or URL
   */
  getValueSet(reference: string): ValueSet | null {
    return this.valueSetService.getValueSet(reference);
  }

  /**
   * Get all registered ValueSets
   */
  getAllValueSets(): ValueSet[] {
    return this.valueSetService.getAllValueSets();
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
    return this.valueSetService.searchValueSets(params);
  }

  /**
   * Remove ValueSet by ID or URL
   */
  removeValueSet(reference: string): boolean {
    this.logger.debug('Removing ValueSet', { reference });
    const result = this.valueSetService.removeValueSet(reference);
    this.logger.info('ValueSet removal completed', { reference, removed: result });
    return result;
  }

  /**
   * Validate a code against a ValueSet
   */
  validateCodeInValueSet(
    valueSetRef: string,
    system?: string,
    code?: string,
    display?: string
  ): { result: boolean; message?: string } {
    return this.valueSetService.validateCode(valueSetRef, system, code, display);
  }

  /**
   * Expand a ValueSet
   */
  expandValueSet(valueSetRef: string, count?: number, offset?: number): ValueSet | null {
    return this.valueSetService.expand(valueSetRef, count, offset);
  }

  // ============================================
  // CODESYSTEM LIBRARY API METHODS
  // ============================================

  /**
   * Register a CodeSystem resource
   */
  registerCodeSystem(codeSystem: CodeSystem): void {
    this.logger.debug('Registering CodeSystem', { id: codeSystem.id });
    this.codeSystemService.registerCodeSystem(codeSystem);
    this.logger.info('CodeSystem registered', { id: codeSystem.id });
  }

  /**
   * Get CodeSystem by ID or URL
   */
  getCodeSystem(reference: string): CodeSystem | null {
    return this.codeSystemService.getCodeSystem(reference);
  }

  /**
   * Get all registered CodeSystems
   */
  getAllCodeSystems(): CodeSystem[] {
    return this.codeSystemService.getAllCodeSystems();
  }

  /**
   * Search CodeSystems by parameters
   */
  searchCodeSystems(params: {
    name?: string;
    status?: string;
    url?: string;
    system?: string;
    publisher?: string;
    content?: string;
  }): CodeSystem[] {
    return this.codeSystemService.searchCodeSystems(params);
  }

  /**
   * Remove CodeSystem by ID or URL
   */
  removeCodeSystem(reference: string): boolean {
    this.logger.debug('Removing CodeSystem', { reference });
    const result = this.codeSystemService.removeCodeSystem(reference);
    this.logger.info('CodeSystem removal completed', { reference, removed: result });
    return result;
  }

  /**
   * Validate a code in a CodeSystem
   */
  validateCodeInCodeSystem(
    systemRef: string,
    code: string,
    display?: string
  ): { result: boolean; display?: string; message?: string } {
    return this.codeSystemService.validateCode(systemRef, code, display);
  }

  /**
   * Lookup concept details in a CodeSystem
   */
  lookupConcept(
    systemRef: string,
    code: string,
    property?: string[]
  ): {
    name?: string;
    display?: string;
    definition?: string;
    designation?: any[];
    property?: any[];
  } | null {
    return this.codeSystemService.lookup(systemRef, code, property);
  }

  /**
   * Test subsumption relationship between two codes
   */
  testSubsumption(
    systemRef: string,
    codeA: string,
    codeB: string
  ): 'equivalent' | 'subsumes' | 'subsumed-by' | 'not-subsumed' {
    return this.codeSystemService.subsumes(systemRef, codeA, codeB);
  }

  // ============================================
  // STRUCTUREMAP LIBRARY API METHODS
  // ============================================

  /**
   * Register a StructureMap resource
   */
  registerStructureMap(structureMap: StructureMap): void {
    this.logger.debug('Registering StructureMap', { id: structureMap.id });
    
    if (structureMap.id) {
      this.structureMapStore.set(structureMap.id, structureMap);
    }
    if (structureMap.url) {
      this.structureMapStore.set(structureMap.url, structureMap);
    }
    
    this.logger.info('StructureMap registered', { id: structureMap.id });
  }

  /**
   * Get all registered StructureMaps
   */
  getAllStructureMaps(): StructureMap[] {
    const unique = new Map<string, StructureMap>();
    this.structureMapStore.forEach((structureMap) => {
      const key = structureMap.id || structureMap.url || Math.random().toString();
      unique.set(key, structureMap);
    });
    return Array.from(unique.values());
  }

  /**
   * Search StructureMaps by parameters
   */
  searchStructureMaps(params: {
    name?: string;
    status?: string;
    url?: string;
  }): StructureMap[] {
    let results = this.getAllStructureMaps();

    if (params.name) {
      results = results.filter(sm => 
        sm.name?.toLowerCase().includes(params.name!.toLowerCase())
      );
    }

    if (params.status) {
      results = results.filter(sm => sm.status === params.status);
    }

    if (params.url) {
      results = results.filter(sm => sm.url === params.url);
    }

    return results;
  }

  /**
   * Remove StructureMap by ID or URL
   */
  removeStructureMap(reference: string): boolean {
    this.logger.debug('Removing StructureMap', { reference });
    
    const structureMap = this.structureMapStore.get(reference);
    if (structureMap) {
      if (structureMap.id) {
        this.structureMapStore.delete(structureMap.id);
      }
      if (structureMap.url) {
        this.structureMapStore.delete(structureMap.url);
      }
      this.logger.info('StructureMap removed', { reference });
      return true;
    }
    
    this.logger.warn('StructureMap not found for removal', { reference });
    return false;
  }
}

// Export main classes and types
export * from './types';
export { FmlCompiler } from './lib/fml-compiler';
export { StructureMapRetriever } from './lib/structure-map-retriever';
export { StructureMapExecutor } from './lib/structure-map-executor';
export { ValidationService } from './lib/validation-service';
export { ConceptMapService } from './lib/conceptmap-service';
export { ValueSetService } from './lib/valueset-service';
export { CodeSystemService } from './lib/codesystem-service';
export { BundleService, BundleProcessingResult } from './lib/bundle-service';
export { Logger } from './lib/logger';
export { SchemaValidator } from './lib/schema-validator';