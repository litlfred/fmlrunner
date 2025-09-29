import { FmlRunner as KotlinFmlRunner } from './lib/kotlin-bridge';
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
 * Now uses shared Kotlin/JS core logic with TypeScript services for extended functionality
 */
export class FmlRunner {
  private kotlinCore: KotlinFmlRunner;
  private retriever: StructureMapRetriever;
  private validationService: ValidationService;
  private conceptMapService: ConceptMapService;
  private valueSetService: ValueSetService;
  private codeSystemService: CodeSystemService;
  private bundleService: BundleService;
  private schemaValidator: SchemaValidator;
  private logger: Logger;
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
    
    // Initialize Kotlin core for FML compilation and execution
    this.kotlinCore = new KotlinFmlRunner(this.options);
    
    // Initialize TypeScript services for extended functionality
    this.retriever = new StructureMapRetriever(this.logger, this.options.baseUrl);
    this.validationService = new ValidationService(this.logger);
    this.conceptMapService = new ConceptMapService(this.logger);
    this.valueSetService = new ValueSetService(this.logger);
    this.codeSystemService = new CodeSystemService(this.logger);
    
    // Create bundle service with references to all resource services
    this.bundleService = new BundleService(
      this.conceptMapService,
      this.valueSetService,
      this.codeSystemService,
      this.logger
    );

    this.logger.info('FmlRunner initialized with Kotlin core', { options: this.options });
  }

  /**
   * Compile FML content to StructureMap using Kotlin core
   */
  compileFml(fmlContent: string): FmlCompilationResult {
    this.logger.debug('Compiling FML using Kotlin core', { contentLength: fmlContent.length });
    
    if (this.options.validateInputOutput) {
      const validation = this.schemaValidator.validateFmlInput(fmlContent);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: []
        };
      }
    }

    return this.kotlinCore.compileFml(fmlContent);
  }

  /**
   * Execute StructureMap on input content using Kotlin core
   */
  async executeStructureMap(structureMapReference: string, inputContent: any): Promise<ExecutionResult> {
    this.logger.debug('Executing StructureMap using Kotlin core', { structureMapReference });
    
    // Try to get from Kotlin core first
    let structureMap = this.kotlinCore.getStructureMap(structureMapReference);
    
    // If not found in core, try to retrieve using TypeScript retriever
    if (!structureMap) {
      structureMap = await this.retriever.getStructureMap(structureMapReference);
      if (structureMap) {
        // Register with Kotlin core for future use
        this.kotlinCore.registerStructureMap(structureMap);
      }
    }

    if (!structureMap) {
      return {
        success: false,
        errors: [`StructureMap not found: ${structureMapReference}`]
      };
    }

    const options: ExecutionOptions = {
      strictMode: this.options.strictMode,
      validateInput: this.options.validateInputOutput,
      validateOutput: this.options.validateInputOutput
    };

    return this.kotlinCore.executeStructureMap(structureMapReference, inputContent, options);
  }

  /**
   * Execute StructureMap with enhanced validation and logging
   */
  async executeStructureMapWithValidation(
    structureMapReference: string,
    inputContent: any,
    structureDefinitions?: StructureDefinition[]
  ): Promise<EnhancedExecutionResult> {
    this.logger.debug('Executing StructureMap with validation', { structureMapReference });

    const startTime = Date.now();
    
    try {
      // Execute using Kotlin core
      const executionResult = await this.executeStructureMap(structureMapReference, inputContent);
      
      const endTime = Date.now();
      
      if (!executionResult.success) {
        return {
          ...executionResult,
          executionTime: endTime - startTime,
          validationResults: []
        };
      }

      // Enhanced validation using TypeScript services
      const validationResults: any[] = [];
      
      if (this.options.validateInputOutput && structureDefinitions) {
        for (const sd of structureDefinitions) {
          const validation = this.validationService.validateResource(
            JSON.parse(executionResult.result || '{}'), 
            sd
          );
          validationResults.push({
            structureDefinition: sd.url,
            valid: validation.valid,
            errors: validation.errors
          });
        }
      }

      return {
        ...executionResult,
        executionTime: endTime - startTime,
        validationResults
      };
    } catch (error) {
      const endTime = Date.now();
      this.logger.error('Enhanced StructureMap execution failed', { error: error.message });
      
      return {
        success: false,
        errors: [error.message],
        executionTime: endTime - startTime,
        validationResults: []
      };
    }
  }

  /**
   * Register StructureMap - delegates to both Kotlin core and TypeScript services
   */
  registerStructureMap(structureMap: StructureMap): boolean {
    this.logger.debug('Registering StructureMap in both Kotlin core and TypeScript services', { 
      name: structureMap.name 
    });
    
    // Register with Kotlin core
    const kotlinResult = this.kotlinCore.registerStructureMap(structureMap);
    
    // Also register with TypeScript retriever for compatibility
    if (kotlinResult) {
      this.retriever.registerStructureMap(structureMap);
    }
    
    return kotlinResult;
  }

  /**
   * Get StructureMap - tries Kotlin core first, then TypeScript services
   */
  getStructureMap(reference: string): StructureMap | null {
    // Try Kotlin core first
    let structureMap = this.kotlinCore.getStructureMap(reference);
    
    // If not found, try TypeScript retriever
    if (!structureMap) {
      try {
        structureMap = this.retriever.getStructureMapSync(reference);
        if (structureMap) {
          // Register with Kotlin core for future use
          this.kotlinCore.registerStructureMap(structureMap);
        }
      } catch (error) {
        this.logger.debug('StructureMap not found in TypeScript retriever', { reference });
      }
    }
    
    return structureMap;
  }

  /**
   * Get all StructureMaps from Kotlin core
   */
  getAllStructureMaps(): StructureMap[] {
    return this.kotlinCore.getAllStructureMaps();
  }

  /**
   * Search StructureMaps using Kotlin core
   */
  searchStructureMaps(params: {
    name?: string;
    status?: string;
    url?: string;
  }): StructureMap[] {
    return this.kotlinCore.searchStructureMaps(params);
  }

  /**
   * Remove StructureMap from both Kotlin core and TypeScript services
   */
  removeStructureMap(reference: string): boolean {
    this.logger.debug('Removing StructureMap from both cores', { reference });
    
    const kotlinResult = this.kotlinCore.removeStructureMap(reference);
    this.retriever.removeStructureMap(reference);
    
    return kotlinResult;
  }

  // Terminology services (TypeScript implementation)
  
  /**
   * Register ConceptMap
   */
  registerConceptMap(conceptMap: ConceptMap): void {
    this.logger.debug('Registering ConceptMap', { url: conceptMap.url });
    this.conceptMapService.registerConceptMap(conceptMap);
  }

  /**
   * Get ConceptMap
   */
  getConceptMap(reference: string): ConceptMap | null {
    return this.conceptMapService.getConceptMap(reference);
  }

  /**
   * Search ConceptMaps
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
   * Remove ConceptMap
   */
  removeConceptMap(reference: string): boolean {
    this.logger.debug('Removing ConceptMap', { reference });
    const result = this.conceptMapService.removeConceptMap(reference);
    this.logger.info('ConceptMap removal completed', { reference, removed: result });
    return result;
  }

  /**
   * Register ValueSet
   */
  registerValueSet(valueSet: ValueSet): void {
    this.logger.debug('Registering ValueSet', { url: valueSet.url });
    this.valueSetService.registerValueSet(valueSet);
  }

  /**
   * Get ValueSet
   */
  getValueSet(reference: string): ValueSet | null {
    return this.valueSetService.getValueSet(reference);
  }

  /**
   * Search ValueSets
   */
  searchValueSets(params: {
    name?: string;
    status?: string;
    url?: string;
    publisher?: string;
  }): ValueSet[] {
    return this.valueSetService.searchValueSets(params);
  }

  /**
   * Remove ValueSet
   */
  removeValueSet(reference: string): boolean {
    this.logger.debug('Removing ValueSet', { reference });
    const result = this.valueSetService.removeValueSet(reference);
    this.logger.info('ValueSet removal completed', { reference, removed: result });
    return result;
  }

  /**
   * Register CodeSystem
   */
  registerCodeSystem(codeSystem: CodeSystem): void {
    this.logger.debug('Registering CodeSystem', { url: codeSystem.url });
    this.codeSystemService.registerCodeSystem(codeSystem);
  }

  /**
   * Get CodeSystem
   */
  getCodeSystem(reference: string): CodeSystem | null {
    return this.codeSystemService.getCodeSystem(reference);
  }

  /**
   * Search CodeSystems
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
   * Remove CodeSystem
   */
  removeCodeSystem(reference: string): boolean {
    this.logger.debug('Removing CodeSystem', { reference });
    const result = this.codeSystemService.removeCodeSystem(reference);
    this.logger.info('CodeSystem removal completed', { reference, removed: result });
    return result;
  }

  /**
   * Process Bundle
   */
  async processBundle(bundle: Bundle): Promise<BundleProcessingResult> {
    this.logger.debug('Processing Bundle', { 
      entryCount: bundle.entry?.length || 0 
    });
    
    const result = await this.bundleService.processBundle(bundle);
    
    this.logger.info('Bundle processing completed', {
      processed: result.processed,
      errors: result.errors.length
    });
    
    return result;
  }

  /**
   * Get Bundle statistics
   */
  getBundleStats(): any {
    return this.bundleService.getStats();
  }

  /**
   * Clear all resources
   */
  clear(): void {
    this.logger.info('Clearing all caches');
    this.kotlinCore.clear();
    this.conceptMapService.clear();
    this.valueSetService.clear();
    this.codeSystemService.clear();
  }

  /**
   * Set base directory for StructureMap retrieval
   */
  setBaseDirectory(directory: string): void {
    this.logger.debug('Setting base directory', { directory });
    this.retriever.setBaseDirectory(directory);
  }

  /**
   * Get count of registered StructureMaps
   */
  getCount(): number {
    return this.kotlinCore.getCount();
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