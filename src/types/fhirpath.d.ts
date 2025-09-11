declare module 'fhirpath' {
  /**
   * Evaluate a FHIRPath expression against a resource
   * @param resource - The FHIR resource or data to evaluate against
   * @param expression - The FHIRPath expression to evaluate
   * @param context - Optional context for the evaluation
   * @returns Array of results from the evaluation
   */
  export function evaluate(resource: any, expression: string, context?: any): any[];

  /**
   * Parse a FHIRPath expression into an AST
   * @param expression - The FHIRPath expression to parse
   * @returns Parsed AST
   */
  export function parse(expression: string): any;

  /**
   * Compile a FHIRPath expression for faster repeated evaluation
   * @param expression - The FHIRPath expression to compile
   * @returns Compiled expression function
   */
  export function compile(expression: string): (resource: any, context?: any) => any[];

  /**
   * Library version
   */
  export const version: string;

  /**
   * Utility functions
   */
  export const util: any;
  export const types: any;
  export const ucumUtils: any;
  export const resolveInternalTypes: any;
}