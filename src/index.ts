import { FmlCompiler } from './lib/fml-compiler';
import { StructureMapRetriever } from './lib/structure-map-retriever';
import { StructureMapExecutor } from './lib/structure-map-executor';
import { ValidationService } from './lib/validation-service';
import { 
  StructureMap, 
  FmlCompilationResult, 
  ExecutionResult, 
  EnhancedExecutionResult,
  ExecutionOptions,
  FmlRunnerOptions,
  StructureDefinition 
} from './types';

/**
 * Main FmlRunner class providing FML compilation and StructureMap execution
 */
export class FmlRunner {
  private compiler: FmlCompiler;
  private retriever: StructureMapRetriever;
  private executor: StructureMapExecutor;
  private options: FmlRunnerOptions;

  constructor(options: FmlRunnerOptions = {}) {
    this.compiler = new FmlCompiler();
    this.retriever = new StructureMapRetriever();
    this.executor = new StructureMapExecutor();
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
}

// Export main classes and types
export * from './types';
export { FmlCompiler } from './lib/fml-compiler';
export { StructureMapRetriever } from './lib/structure-map-retriever';
export { StructureMapExecutor } from './lib/structure-map-executor';
export { ValidationService } from './lib/validation-service';
export { FmlRunnerApi } from './api/server';