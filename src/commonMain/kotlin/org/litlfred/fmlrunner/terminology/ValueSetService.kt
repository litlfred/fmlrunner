package org.litlfred.fmlrunner.terminology

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

/**
 * FHIR ValueSet resource definition for code validation
 * Based on FHIR R4 ValueSet specification
 */
@Serializable
data class ValueSet(
    val resourceType: String = "ValueSet",
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
    val immutable: Boolean? = null,
    val purpose: String? = null,
    val copyright: String? = null,
    val compose: ValueSetCompose? = null,
    val expansion: ValueSetExpansion? = null
)

@Serializable
data class ValueSetCompose(
    val lockedDate: String? = null,
    val inactive: Boolean? = null,
    val include: List<ValueSetComposeInclude>,
    val exclude: List<ValueSetComposeInclude>? = null
)

@Serializable
data class ValueSetComposeInclude(
    val system: String? = null,
    val version: String? = null,
    val concept: List<ValueSetComposeIncludeConcept>? = null,
    val filter: List<ValueSetComposeIncludeFilter>? = null,
    val valueSet: List<String>? = null
)

@Serializable
data class ValueSetComposeIncludeConcept(
    val code: String,
    val display: String? = null,
    val designation: List<ValueSetComposeIncludeConceptDesignation>? = null
)

@Serializable
data class ValueSetComposeIncludeConceptDesignation(
    val language: String? = null,
    val use: Coding? = null,
    val value: String
)

@Serializable
data class ValueSetComposeIncludeFilter(
    val property: String,
    val op: String, // = | is-a | descendent-of | is-not-a | regex | in | not-in | generalizes | exists
    val value: String
)

@Serializable
data class ValueSetExpansion(
    val identifier: String? = null,
    val timestamp: String,
    val total: Int? = null,
    val offset: Int? = null,
    val parameter: List<ValueSetExpansionParameter>? = null,
    val contains: List<ValueSetExpansionContains>? = null
)

@Serializable
data class ValueSetExpansionParameter(
    val name: String,
    val valueString: String? = null,
    val valueBoolean: Boolean? = null,
    val valueInteger: Int? = null,
    val valueDecimal: Double? = null,
    val valueUri: String? = null,
    val valueCode: String? = null,
    val valueDateTime: String? = null
)

@Serializable
data class ValueSetExpansionContains(
    val system: String? = null,
    val abstract: Boolean? = null,
    val inactive: Boolean? = null,
    val version: String? = null,
    val code: String? = null,
    val display: String? = null,
    val designation: List<ValueSetComposeIncludeConceptDesignation>? = null,
    val contains: List<ValueSetExpansionContains>? = null
)

/**
 * Result of code validation operation
 */
@Serializable
data class ValidationResult(
    val result: Boolean,
    val message: String? = null,
    val display: String? = null,
    val system: String? = null,
    val code: String? = null
)

/**
 * ValueSet Service using kotlin-fhir compatible types
 * This replaces the TypeScript ValueSetService with a kotlin-fhir based implementation
 */
class ValueSetService {
    private val valueSets = mutableMapOf<String, ValueSet>()

    /**
     * Register a ValueSet resource
     */
    fun registerValueSet(valueSet: ValueSet) {
        valueSet.id?.let { id ->
            valueSets[id] = valueSet
        }
        valueSet.url?.let { url ->
            valueSets[url] = valueSet
        }
    }

    /**
     * Get ValueSet by ID or URL
     */
    fun getValueSet(reference: String): ValueSet? {
        return valueSets[reference]
    }

    /**
     * Get all ValueSets
     */
    fun getAllValueSets(): List<ValueSet> {
        val unique = mutableMapOf<String, ValueSet>()
        valueSets.values.forEach { valueSet ->
            val key = valueSet.id ?: valueSet.url ?: valueSet.hashCode().toString()
            unique[key] = valueSet
        }
        return unique.values.toList()
    }

    /**
     * Search ValueSets by parameters
     */
    fun searchValueSets(
        name: String? = null,
        status: String? = null,
        url: String? = null,
        publisher: String? = null
    ): List<ValueSet> {
        var results = getAllValueSets()

        name?.let { searchName ->
            results = results.filter { vs ->
                vs.name?.contains(searchName, ignoreCase = true) == true ||
                vs.title?.contains(searchName, ignoreCase = true) == true
            }
        }

        status?.let { searchStatus ->
            results = results.filter { it.status == searchStatus }
        }

        url?.let { searchUrl ->
            results = results.filter { it.url == searchUrl }
        }

        publisher?.let { searchPublisher ->
            results = results.filter { vs ->
                vs.publisher?.contains(searchPublisher, ignoreCase = true) == true
            }
        }

        return results
    }

    /**
     * Remove ValueSet by ID or URL
     */
    fun removeValueSet(reference: String): Boolean {
        return valueSets.remove(reference) != null
    }

    /**
     * Validate a code in a ValueSet (kotlin-fhir compatible implementation)
     */
    fun validateCode(
        code: String,
        system: String? = null,
        valueSetUrl: String? = null
    ): ValidationResult {
        val valueSet = valueSetUrl?.let { getValueSet(it) }
        
        if (valueSet == null) {
            return ValidationResult(
                result = false,
                message = "ValueSet not found: $valueSetUrl"
            )
        }

        // Check if code is in the expansion
        valueSet.expansion?.contains?.forEach { contains ->
            if (contains.code == code && (system == null || contains.system == system)) {
                return ValidationResult(
                    result = true,
                    display = contains.display,
                    system = contains.system,
                    code = contains.code
                )
            }
        }

        // Check if code is in the compose include
        valueSet.compose?.include?.forEach { include ->
            if (system == null || include.system == system) {
                include.concept?.forEach { concept ->
                    if (concept.code == code) {
                        return ValidationResult(
                            result = true,
                            display = concept.display,
                            system = include.system,
                            code = concept.code
                        )
                    }
                }
            }
        }

        // Check if excluded
        valueSet.compose?.exclude?.forEach { exclude ->
            if (system == null || exclude.system == system) {
                exclude.concept?.forEach { concept ->
                    if (concept.code == code) {
                        return ValidationResult(
                            result = false,
                            message = "Code is explicitly excluded from ValueSet",
                            system = exclude.system,
                            code = concept.code
                        )
                    }
                }
            }
        }

        return ValidationResult(
            result = false,
            message = "Code not found in ValueSet",
            system = system,
            code = code
        )
    }

    /**
     * Expand a ValueSet (basic implementation)
     */
    fun expandValueSet(valueSetUrl: String): ValueSetExpansion? {
        val valueSet = getValueSet(valueSetUrl) ?: return null

        // Return existing expansion if available
        valueSet.expansion?.let { return it }

        // Create basic expansion from compose
        val contains = mutableListOf<ValueSetExpansionContains>()
        var total = 0

        valueSet.compose?.include?.forEach { include ->
            include.concept?.forEach { concept ->
                contains.add(
                    ValueSetExpansionContains(
                        system = include.system,
                        code = concept.code,
                        display = concept.display,
                        designation = concept.designation
                    )
                )
                total++
            }
        }

        return ValueSetExpansion(
            timestamp = kotlinx.datetime.Clock.System.now().toString(),
            total = total,
            contains = contains
        )
    }

    /**
     * Clear all ValueSets
     */
    fun clear() {
        valueSets.clear()
    }

    /**
     * Get count of registered ValueSets
     */
    fun getCount(): Int {
        return getAllValueSets().size
    }
}