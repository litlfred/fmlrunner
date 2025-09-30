/**
 * FHIR Mapping Language (FML) Runner - TypeScript Declarations
 * 
 * This file provides TypeScript definitions for the Kotlin/JS compiled FmlRunner library.
 * The actual implementation is generated from Kotlin multiplatform code.
 */

export interface FmlCompilationResult {
  success: boolean;
  structureMap?: string;
  errors?: string[];
}

export interface FmlExecutionResult {
  success: boolean;
  result?: any;
  errors?: string[];
}

export interface FmlRunnerOptions {
  strictMode?: boolean;
  validateInput?: boolean;
  validateOutput?: boolean;
}

/**
 * Main FML Runner class for compiling and executing FHIR Mapping Language
 */
export declare class FmlRunner {
  constructor(options?: FmlRunnerOptions);
  
  /**
   * Compile FML content into a FHIR StructureMap
   */
  compileFml(fmlContent: string): FmlCompilationResult;
  
  /**
   * Execute a StructureMap transformation
   */
  executeStructureMap(mapUrl: string, inputData: string): FmlExecutionResult;
  
  /**
   * Get platform name (should return "JavaScript")
   */
  getPlatformName(): string;
}

/**
 * Get the platform name
 */
export declare function getPlatformName(): string;

// Default export
export default FmlRunner;