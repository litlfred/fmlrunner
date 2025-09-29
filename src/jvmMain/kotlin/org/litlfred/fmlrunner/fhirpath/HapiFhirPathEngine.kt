package org.litlfred.fmlrunner.fhirpath

/**
 * JVM-specific factory function to create FHIRPath engine
 * For now, uses the basic engine. Future versions will integrate HAPI FHIR
 */
actual fun createFhirPathEngine(): FhirPathEngine {
    return BasicFhirPathEngine()
}