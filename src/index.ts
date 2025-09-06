import { FmlCompiler } from './lib/fml-compiler';
import { StructureMapRetriever } from './lib/structure-map-retriever';
import { StructureMapExecutor } from './lib/structure-map-executor';
import { StructureMap, FmlCompilationResult, ExecutionResult, FmlRunnerOptions } from './types';

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
export { FmlRunnerApi } from './api/server';