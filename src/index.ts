import { FmlCompiler } from './lib/fml-compiler';
import { StructureMap, FmlCompilationResult, ExecutionResult, FmlRunnerOptions } from './types';

/**
 * Main FmlRunner class providing FML compilation and StructureMap execution
 */
export class FmlRunner {
  private compiler: FmlCompiler;
  private options: FmlRunnerOptions;
  private cache: Map<string, StructureMap> = new Map();

  constructor(options: FmlRunnerOptions = {}) {
    this.compiler = new FmlCompiler();
    this.options = {
      cacheEnabled: true,
      timeout: 5000,
      ...options
    };
  }

  /**
   * Compile FML content to StructureMap
   */
  compileFml(fmlContent: string): FmlCompilationResult {
    return this.compiler.compile(fmlContent);
  }

  /**
   * Execute StructureMap on input content (placeholder implementation)
   */
  executeStructureMap(structureMapReference: string, inputContent: any): Promise<ExecutionResult> {
    // This is a placeholder - real implementation would load the StructureMap and execute it
    return Promise.resolve({
      success: false,
      errors: ['StructureMap execution not yet implemented']
    });
  }

  /**
   * Retrieve StructureMap by reference (placeholder implementation) 
   */
  getStructureMap(reference: string): Promise<StructureMap | null> {
    // This is a placeholder - real implementation would load from file/URL
    return Promise.resolve(null);
  }

  /**
   * Clear the internal cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export types
export * from './types';
export { FmlCompiler };