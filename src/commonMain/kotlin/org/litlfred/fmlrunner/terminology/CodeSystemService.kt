package org.litlfred.fmlrunner.terminology

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

/**
 * FHIR CodeSystem resource definition for code lookup and validation
 * Based on FHIR R4 CodeSystem specification
 */
@Serializable
data class CodeSystem(
    val resourceType: String = "CodeSystem",
    val id: String? = null,
    val url: String? = null,
    val identifier: List<Identifier>? = null,
    val version: String? = null,
    val name: String? = null,
    val title: String? = null,
    val status: String, // draft | active | retired | unknown
    val experimental: Boolean? = null,
    val date: String? = null,
    val publisher: String? = null,
    val contact: List<ContactDetail>? = null,
    val description: String? = null,
    val useContext: List<UsageContext>? = null,
    val jurisdiction: List<CodeableConcept>? = null,
    val purpose: String? = null,
    val copyright: String? = null,
    val caseSensitive: Boolean? = null,
    val valueSet: String? = null,
    val hierarchyMeaning: String? = null, // grouped-by | is-a | part-of | classified-with
    val compositional: Boolean? = null,
    val versionNeeded: Boolean? = null,
    val content: String, // not-present | example | fragment | complete | supplement
    val supplements: String? = null,
    val count: Int? = null,
    val filter: List<CodeSystemFilter>? = null,
    val property: List<CodeSystemProperty>? = null,
    val concept: List<CodeSystemConcept>? = null
)

@Serializable
data class CodeSystemFilter(
    val code: String,
    val description: String? = null,
    val operator: List<String>, // = | is-a | descendent-of | is-not-a | regex | in | not-in | generalizes | exists
    val value: String
)

@Serializable
data class CodeSystemProperty(
    val code: String,
    val uri: String? = null,
    val description: String? = null,
    val type: String // code | Coding | string | integer | boolean | dateTime | decimal
)

@Serializable
data class CodeSystemConcept(
    val code: String,
    val display: String? = null,
    val definition: String? = null,
    val designation: List<CodeSystemConceptDesignation>? = null,
    val property: List<CodeSystemConceptProperty>? = null,
    val concept: List<CodeSystemConcept>? = null
)

@Serializable
data class CodeSystemConceptDesignation(
    val language: String? = null,
    val use: Coding? = null,
    val value: String
)

@Serializable
data class CodeSystemConceptProperty(
    val code: String,
    val valueCode: String? = null,
    val valueCoding: Coding? = null,
    val valueString: String? = null,
    val valueInteger: Int? = null,
    val valueBoolean: Boolean? = null,
    val valueDateTime: String? = null,
    val valueDecimal: Double? = null
)

/**
 * Result of code lookup operation
 */
@Serializable
data class LookupResult(
    val name: String? = null,
    val version: String? = null,
    val display: String? = null,
    val designation: List<CodeSystemConceptDesignation>? = null,
    val property: List<CodeSystemConceptProperty>? = null
)

/**
 * CodeSystem Service using kotlin-fhir compatible types
 * This replaces the TypeScript CodeSystemService with a kotlin-fhir based implementation
 */
class CodeSystemService {
    private val codeSystems = mutableMapOf<String, CodeSystem>()

    /**
     * Register a CodeSystem resource
     */
    fun registerCodeSystem(codeSystem: CodeSystem) {
        codeSystem.id?.let { id ->
            codeSystems[id] = codeSystem
        }
        codeSystem.url?.let { url ->
            codeSystems[url] = codeSystem
        }
    }

    /**
     * Get CodeSystem by ID or URL
     */
    fun getCodeSystem(reference: String): CodeSystem? {
        return codeSystems[reference]
    }

    /**
     * Get all CodeSystems
     */
    fun getAllCodeSystems(): List<CodeSystem> {
        val unique = mutableMapOf<String, CodeSystem>()
        codeSystems.values.forEach { codeSystem ->
            val key = codeSystem.id ?: codeSystem.url ?: codeSystem.hashCode().toString()
            unique[key] = codeSystem
        }
        return unique.values.toList()
    }

    /**
     * Search CodeSystems by parameters
     */
    fun searchCodeSystems(
        name: String? = null,
        status: String? = null,
        url: String? = null,
        system: String? = null,
        publisher: String? = null,
        content: String? = null
    ): List<CodeSystem> {
        var results = getAllCodeSystems()

        name?.let { searchName ->
            results = results.filter { cs ->
                cs.name?.contains(searchName, ignoreCase = true) == true ||
                cs.title?.contains(searchName, ignoreCase = true) == true
            }
        }

        status?.let { searchStatus ->
            results = results.filter { it.status == searchStatus }
        }

        url?.let { searchUrl ->
            results = results.filter { it.url == searchUrl }
        }

        system?.let { searchSystem ->
            results = results.filter { it.url == searchSystem }
        }

        publisher?.let { searchPublisher ->
            results = results.filter { cs ->
                cs.publisher?.contains(searchPublisher, ignoreCase = true) == true
            }
        }

        content?.let { searchContent ->
            results = results.filter { it.content == searchContent }
        }

        return results
    }

    /**
     * Remove CodeSystem by ID or URL
     */
    fun removeCodeSystem(reference: String): Boolean {
        return codeSystems.remove(reference) != null
    }

    /**
     * Validate a code in a CodeSystem (kotlin-fhir compatible implementation)
     */
    fun validateCode(
        system: String,
        code: String,
        display: String? = null
    ): ValidationResult {
        val codeSystem = getCodeSystem(system)
        
        if (codeSystem == null) {
            return ValidationResult(
                result = false,
                message = "CodeSystem not found: $system"
            )
        }

        // Find the concept
        val concept = findConcept(codeSystem.concept, code)
        
        if (concept == null) {
            return ValidationResult(
                result = false,
                message = "Code not found in CodeSystem",
                system = system,
                code = code
            )
        }

        // Validate display if provided
        if (display != null && concept.display != display) {
            return ValidationResult(
                result = false,
                message = "Incorrect display for code. Expected: ${concept.display}, Provided: $display",
                system = system,
                code = code,
                display = concept.display
            )
        }

        return ValidationResult(
            result = true,
            system = system,
            code = code,
            display = concept.display
        )
    }

    /**
     * Lookup a code in a CodeSystem
     */
    fun lookupCode(system: String, code: String): LookupResult? {
        val codeSystem = getCodeSystem(system) ?: return null
        val concept = findConcept(codeSystem.concept, code) ?: return null

        return LookupResult(
            name = codeSystem.name,
            version = codeSystem.version,
            display = concept.display,
            designation = concept.designation,
            property = concept.property
        )
    }

    /**
     * Check if a code is a child of another code (is-a relationship)
     */
    fun subsumes(system: String, codeA: String, codeB: String): Boolean {
        val codeSystem = getCodeSystem(system) ?: return false
        
        // Find codeA concept
        val conceptA = findConcept(codeSystem.concept, codeA) ?: return false
        
        // Check if codeB is a descendant of codeA
        return isDescendant(conceptA.concept, codeB)
    }

    /**
     * Helper function to find a concept by code recursively
     */
    private fun findConcept(concepts: List<CodeSystemConcept>?, code: String): CodeSystemConcept? {
        concepts?.forEach { concept ->
            if (concept.code == code) {
                return concept
            }
            
            // Search in child concepts
            val childConcept = findConcept(concept.concept, code)
            if (childConcept != null) {
                return childConcept
            }
        }
        return null
    }

    /**
     * Helper function to check if a code is a descendant of a concept
     */
    private fun isDescendant(concepts: List<CodeSystemConcept>?, code: String): Boolean {
        concepts?.forEach { concept ->
            if (concept.code == code) {
                return true
            }
            
            if (isDescendant(concept.concept, code)) {
                return true
            }
        }
        return false
    }

    /**
     * Clear all CodeSystems
     */
    fun clear() {
        codeSystems.clear()
    }

    /**
     * Get count of registered CodeSystems
     */
    fun getCount(): Int {
        return getAllCodeSystems().size
    }
}