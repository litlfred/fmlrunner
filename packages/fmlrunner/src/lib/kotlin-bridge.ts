import { 
  FmlRunner as KotlinFmlRunner, 
  FmlCompiler as KotlinFmlCompiler,
  StructureMapExecutor as KotlinStructureMapExecutor,
  FmlCompilationResult,
  ExecutionResult,
  ExecutionOptions,
  StructureMap
} from '@litlfred/fmlrunner-core';
import { Logger } from './logger';

/**
 * TypeScript wrapper around Kotlin/JS core implementation
 * This provides a bridge between the existing TypeScript API and the shared Kotlin core
 */
export class FmlRunner {
  private kotlinCore: KotlinFmlRunner;
  private logger: Logger;

  constructor(options: any = {}) {
    this.logger = new Logger('FmlRunner', options.logLevel);
    this.kotlinCore = new KotlinFmlRunner();
    
    this.logger.info('FmlRunner initialized with Kotlin core', { options });
  }

  /**
   * Compile FML content to StructureMap using Kotlin core
   */
  compileFml(fmlContent: string): FmlCompilationResult {
    this.logger.debug('Compiling FML content', { contentLength: fmlContent.length });
    
    try {
      const result = this.kotlinCore.compileFml(fmlContent);
      this.logger.info('FML compilation completed', { 
        success: result.success, 
        errorsCount: result.errors.length 
      });
      return result;
    } catch (error) {
      this.logger.error('FML compilation failed', { error: error.message });
      return {
        success: false,
        errors: [`Compilation error: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * Execute StructureMap using Kotlin core
   */
  async executeStructureMap(
    structureMapReference: string, 
    inputContent: any, 
    options?: ExecutionOptions
  ): Promise<ExecutionResult> {
    this.logger.debug('Executing StructureMap', { structureMapReference });
    
    try {
      const inputString = typeof inputContent === 'string' ? inputContent : JSON.stringify(inputContent);
      const result = this.kotlinCore.executeStructureMap(structureMapReference, inputString, options);
      
      this.logger.info('StructureMap execution completed', { 
        success: result.success, 
        errorsCount: result.errors.length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('StructureMap execution failed', { error: error.message });
      return {
        success: false,
        errors: [`Execution error: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * Register StructureMap using Kotlin core
   */
  registerStructureMap(structureMap: StructureMap): boolean {
    this.logger.debug('Registering StructureMap', { 
      name: structureMap.name, 
      url: structureMap.url 
    });
    
    const result = this.kotlinCore.registerStructureMap(structureMap);
    this.logger.info('StructureMap registration completed', { 
      success: result, 
      name: structureMap.name 
    });
    
    return result;
  }

  /**
   * Get StructureMap using Kotlin core
   */
  getStructureMap(reference: string): StructureMap | null {
    this.logger.debug('Getting StructureMap', { reference });
    return this.kotlinCore.getStructureMap(reference);
  }

  /**
   * Get all StructureMaps using Kotlin core
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
    this.logger.debug('Searching StructureMaps', params);
    return this.kotlinCore.searchStructureMaps(params.name, params.status as any, params.url);
  }

  /**
   * Remove StructureMap using Kotlin core
   */
  removeStructureMap(reference: string): boolean {
    this.logger.debug('Removing StructureMap', { reference });
    const result = this.kotlinCore.removeStructureMap(reference);
    this.logger.info('StructureMap removal completed', { reference, removed: result });
    return result;
  }

  /**
   * Clear all StructureMaps using Kotlin core
   */
  clear(): void {
    this.logger.info('Clearing all StructureMaps');
    this.kotlinCore.clear();
  }

  /**
   * Get count of StructureMaps using Kotlin core
   */
  getCount(): number {
    return this.kotlinCore.getCount();
  }

  /**
   * Validate StructureMap using Kotlin core
   */
  validateStructureMap(structureMap: StructureMap): { valid: boolean; errors: string[] } {
    this.logger.debug('Validating StructureMap', { name: structureMap.name });
    return this.kotlinCore.validateStructureMap(structureMap);
  }

  /**
   * Compile and register FML using Kotlin core
   */
  compileAndRegisterFml(fmlContent: string): FmlCompilationResult {
    this.logger.debug('Compiling and registering FML', { contentLength: fmlContent.length });
    const result = this.kotlinCore.compileAndRegisterFml(fmlContent);
    this.logger.info('FML compile and register completed', { 
      success: result.success, 
      errorsCount: result.errors.length 
    });
    return result;
  }

  // Legacy methods that delegate to Kotlin core for backward compatibility
  
  /**
   * @deprecated Use executeStructureMap instead
   */
  async executeStructureMapWithValidation(
    structureMapReference: string,
    inputContent: any,
    options?: any
  ): Promise<ExecutionResult> {
    return this.executeStructureMap(structureMapReference, inputContent, options);
  }

  /**
   * Set base directory (no-op in Kotlin core implementation)
   */
  setBaseDirectory(directory: string): void {
    this.logger.debug('Set base directory called (no-op in Kotlin core)', { directory });
  }
}