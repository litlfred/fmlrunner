package org.litlfred.fmlrunner.fhirpath

/**
 * JS-specific factory function to create FHIRPath engine
 * For now, uses the basic engine. In the future, could integrate with
 * a JavaScript FHIRPath library
 */
actual fun createFhirPathEngine(): FhirPathEngine {
    return BasicFhirPathEngine()
}