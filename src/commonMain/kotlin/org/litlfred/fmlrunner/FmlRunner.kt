package org.litlfred.fmlrunner

import org.litlfred.fmlrunner.types.*
import org.litlfred.fmlrunner.compiler.FmlCompiler
import org.litlfred.fmlrunner.executor.StructureMapExecutor
import org.litlfred.fmlrunner.terminology.*

/**
 * Main FmlRunner class providing FML compilation and StructureMap execution
 * Now includes kotlin-fhir terminology services for comprehensive FHIR processing
 */
class FmlRunner {
    private val compiler = FmlCompiler()
    private val executor = StructureMapExecutor()
    private val structureMapStore = mutableMapOf<String, StructureMap>()
    
    // kotlin-fhir terminology services
    private val conceptMapService = ConceptMapService()
    private val valueSetService = ValueSetService()
    private val codeSystemService = CodeSystemService()
    private val validationService = ValidationService()
    private val bundleService = BundleService(conceptMapService, valueSetService, codeSystemService, validationService)

    /**
     * Compile FML content to StructureMap
     */
    fun compileFml(fmlContent: String): FmlCompilationResult {
        return compiler.compile(fmlContent)
    }

    /**
     * Validate FML syntax without full compilation
     */
    fun validateFmlSyntax(fmlContent: String): FmlSyntaxValidationResult {
        return compiler.validateSyntax(fmlContent)
    }

    /**
     * Execute StructureMap on input content
     */
    fun executeStructureMap(structureMapReference: String, inputContent: String, options: ExecutionOptions = ExecutionOptions()): ExecutionResult {
        val structureMap = getStructureMap(structureMapReference)
            ?: return ExecutionResult(success = false, errors = listOf("StructureMap not found: $structureMapReference"))

        return executor.execute(structureMap, inputContent, options)
    }

    /**
     * Register a StructureMap for later execution
     */
    fun registerStructureMap(structureMap: StructureMap): Boolean {
        return try {
            val key = structureMap.url ?: structureMap.name ?: structureMap.id 
                ?: return false
            structureMapStore[key] = structureMap
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Get StructureMap by reference (URL, name, or ID)
     */
    fun getStructureMap(reference: String): StructureMap? {
        return structureMapStore[reference]
    }

    /**
     * Get all registered StructureMaps
     */
    fun getAllStructureMaps(): List<StructureMap> {
        return structureMapStore.values.toList()
    }

    /**
     * Search StructureMaps by parameters
     */
    fun searchStructureMaps(name: String? = null, status: StructureMapStatus? = null, url: String? = null): List<StructureMap> {
        var results = getAllStructureMaps()

        name?.let { searchName ->
            results = results.filter { 
                it.name?.contains(searchName, ignoreCase = true) == true 
            }
        }

        status?.let { searchStatus ->
            results = results.filter { it.status == searchStatus }
        }

        url?.let { searchUrl ->
            results = results.filter { it.url == searchUrl }
        }

        return results
    }

    /**
     * Remove StructureMap by reference
     */
    fun removeStructureMap(reference: String): Boolean {
        return structureMapStore.remove(reference) != null
    }

    /**
     * Clear all StructureMaps
     */
    fun clear() {
        structureMapStore.clear()
        conceptMapService.clear()
        valueSetService.clear()
        codeSystemService.clear()
        validationService.clear()
        bundleService.clear()
    }

    /**
     * Get count of registered StructureMaps
     */
    fun getCount(): Int {
        return structureMapStore.size
    }

    /**
     * Validate StructureMap structure
     */
    fun validateStructureMap(structureMap: StructureMap): org.litlfred.fmlrunner.executor.ValidationResult {
        return executor.validateStructureMap(structureMap)
    }

    /**
     * Compile and register StructureMap in one operation
     */
    fun compileAndRegisterFml(fmlContent: String): FmlCompilationResult {
        val compilationResult = compileFml(fmlContent)
        if (compilationResult.success && compilationResult.structureMap != null) {
            if (!registerStructureMap(compilationResult.structureMap)) {
                return FmlCompilationResult(
                    success = false,
                    errors = listOf("Failed to register compiled StructureMap")
                )
            }
        }
        return compilationResult
    }

    // kotlin-fhir terminology service methods

    /**
     * Register ConceptMap with kotlin-fhir service
     */
    fun registerConceptMap(conceptMap: org.litlfred.fmlrunner.terminology.ConceptMap) {
        conceptMapService.registerConceptMap(conceptMap)
    }

    /**
     * Get ConceptMap by reference
     */
    fun getConceptMap(reference: String): org.litlfred.fmlrunner.terminology.ConceptMap? {
        return conceptMapService.getConceptMap(reference)
    }

    /**
     * Translate code using kotlin-fhir ConceptMap service
     */
    fun translateCode(sourceSystem: String, sourceCode: String, targetSystem: String? = null): List<TranslationResult> {
        return conceptMapService.translate(sourceSystem, sourceCode, targetSystem)
    }

    /**
     * Register ValueSet with kotlin-fhir service
     */
    fun registerValueSet(valueSet: org.litlfred.fmlrunner.terminology.ValueSet) {
        valueSetService.registerValueSet(valueSet)
    }

    /**
     * Get ValueSet by reference
     */
    fun getValueSet(reference: String): org.litlfred.fmlrunner.terminology.ValueSet? {
        return valueSetService.getValueSet(reference)
    }

    /**
     * Validate code in ValueSet using kotlin-fhir service
     */
    fun validateCodeInValueSet(code: String, system: String? = null, valueSetUrl: String? = null): org.litlfred.fmlrunner.terminology.ValidationResult {
        return valueSetService.validateCode(code, system, valueSetUrl)
    }

    /**
     * Expand ValueSet using kotlin-fhir service
     */
    fun expandValueSet(valueSetUrl: String): ValueSetExpansion? {
        return valueSetService.expandValueSet(valueSetUrl)
    }

    /**
     * Register CodeSystem with kotlin-fhir service
     */
    fun registerCodeSystem(codeSystem: org.litlfred.fmlrunner.terminology.CodeSystem) {
        codeSystemService.registerCodeSystem(codeSystem)
    }

    /**
     * Get CodeSystem by reference
     */
    fun getCodeSystem(reference: String): org.litlfred.fmlrunner.terminology.CodeSystem? {
        return codeSystemService.getCodeSystem(reference)
    }

    /**
     * Lookup code in CodeSystem using kotlin-fhir service
     */
    fun lookupCode(system: String, code: String): LookupResult? {
        return codeSystemService.lookupCode(system, code)
    }

    /**
     * Register StructureDefinition with kotlin-fhir validation service
     */
    fun registerStructureDefinition(structureDefinition: org.litlfred.fmlrunner.terminology.StructureDefinition) {
        validationService.registerStructureDefinition(structureDefinition)
    }

    /**
     * Validate resource against StructureDefinition using kotlin-fhir service
     */
    fun validateResource(resource: kotlinx.serialization.json.JsonElement, structureDefinition: org.litlfred.fmlrunner.terminology.StructureDefinition): ResourceValidationResult {
        return validationService.validateResource(resource, structureDefinition)
    }

    /**
     * Process Bundle using kotlin-fhir service
     */
    fun processBundle(bundle: org.litlfred.fmlrunner.terminology.Bundle): BundleProcessingResult {
        return bundleService.processBundle(bundle)
    }

    /**
     * Get Bundle processing statistics
     */
    fun getBundleStats(): BundleStats {
        return bundleService.getStats()
    }
}

/**
 * Validation result for StructureMap validation
 */
data class ValidationResult(
    val valid: Boolean,
    val errors: List<String>
)