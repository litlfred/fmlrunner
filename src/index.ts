import { FmlCompiler } from './lib/fml-compiler';
import { StructureMapRetriever } from './lib/structure-map-retriever';
import { StructureMapExecutor } from './lib/structure-map-executor';
import { ValidationService } from './lib/validation-service';
import { ConceptMapService } from './lib/conceptmap-service';
import { ValueSetService } from './lib/valueset-service';
import { CodeSystemService } from './lib/codesystem-service';
import { BundleService, BundleProcessingResult } from './lib/bundle-service';
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
 */
export class FmlRunner {
  private compiler: FmlCompiler;
  private retriever: StructureMapRetriever;
  private executor: StructureMapExecutor;
  private conceptMapService: ConceptMapService;
  private valueSetService: ValueSetService;
  private codeSystemService: CodeSystemService;
  private bundleService: BundleService;
  private structureMapStore: Map<string, StructureMap> = new Map();
  private options: FmlRunnerOptions;

  constructor(options: FmlRunnerOptions = {}) {
    this.compiler = new FmlCompiler();
    this.retriever = new StructureMapRetriever();
    this.executor = new StructureMapExecutor();
    this.conceptMapService = new ConceptMapService();
    this.valueSetService = new ValueSetService();
    this.codeSystemService = new CodeSystemService();
    
    // Create bundle service with references to all resource services
    this.bundleService = new BundleService(
      this.conceptMapService,
      this.valueSetService,
      this.codeSystemService,
      this.executor.getValidationService(),
      this.structureMapStore
    );
    
    this.options = {
      cacheEnabled: true,
      timeout: 5000,
      strictMode: false,
      ...options
    };

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
  }

  /**
   * Compile FML content to StructureMap
   */
  compileFml(fmlContent: string): FmlCompilationResult {
    return this.compiler.compile(fmlContent);
  }

  /**
   * Execute StructureMap on input content
   */
  async executeStructureMap(structureMapReference: string, inputContent: any): Promise<ExecutionResult> {
    try {
      // Retrieve the StructureMap
      const structureMap = await this.retriever.getStructureMap(structureMapReference);
      
      if (!structureMap) {
        return {
          success: false,
          errors: [`StructureMap not found: ${structureMapReference}`]
        };
      }

      // Validate the StructureMap
      const validation = this.executor.validateStructureMap(structureMap);
      if (!validation.valid) {
        return {
          success: false,
          errors: [`Invalid StructureMap: ${validation.errors.join(', ')}`]
        };
      }

      // Execute the transformation
      return this.executor.execute(structureMap, inputContent);
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown execution error']
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
    try {
      // Retrieve the StructureMap
      const structureMap = await this.retriever.getStructureMap(structureMapReference);
      
      if (!structureMap) {
        return {
          success: false,
          errors: [`StructureMap not found: ${structureMapReference}`]
        };
      }

      // Validate the StructureMap
      const validation = this.executor.validateStructureMap(structureMap);
      if (!validation.valid) {
        return {
          success: false,
          errors: [`Invalid StructureMap: ${validation.errors.join(', ')}`]
        };
      }

      // Execute the transformation with validation
      const mergedOptions = {
        strictMode: this.options.strictMode,
        ...options
      };
      
      return this.executor.execute(structureMap, inputContent, mergedOptions);
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown execution error']
      };
    }
  }

  /**
   * Register a StructureDefinition for validation
   */
  registerStructureDefinition(structureDefinition: StructureDefinition): void {
    const validationService = this.executor.getValidationService();
    validationService.registerStructureDefinition(structureDefinition);
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
    return this.retriever.getStructureMap(reference);
  }

  /**
   * Clear all internal caches
   */
  clearCache(): void {
    this.retriever.clearCache();
  }

  /**
   * Set base directory for StructureMap file loading
   */
  setBaseDirectory(directory: string): void {
    this.retriever.setBaseDirectory(directory);
  }

  // ============================================
  // LIBRARY API METHODS FOR RESOURCE MANAGEMENT
  // ============================================

  /**
   * Process a FHIR Bundle and load all resources
   */
  processBundle(bundle: Bundle): BundleProcessingResult {
    return this.bundleService.processBundle(bundle);
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
    this.bundleService.clearAll();
  }

  // ============================================
  // CONCEPTMAP LIBRARY API METHODS
  // ============================================

  /**
   * Register a ConceptMap resource
   */
  registerConceptMap(conceptMap: ConceptMap): void {
    this.conceptMapService.registerConceptMap(conceptMap);
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
    return this.conceptMapService.removeConceptMap(reference);
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
    this.valueSetService.registerValueSet(valueSet);
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
    return this.valueSetService.removeValueSet(reference);
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
    this.codeSystemService.registerCodeSystem(codeSystem);
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
    return this.codeSystemService.removeCodeSystem(reference);
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
    if (structureMap.id) {
      this.structureMapStore.set(structureMap.id, structureMap);
    }
    if (structureMap.url) {
      this.structureMapStore.set(structureMap.url, structureMap);
    }
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
    const structureMap = this.structureMapStore.get(reference);
    if (structureMap) {
      if (structureMap.id) {
        this.structureMapStore.delete(structureMap.id);
      }
      if (structureMap.url) {
        this.structureMapStore.delete(structureMap.url);
      }
      return true;
    }
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
export { FmlRunnerApi } from './api/server';