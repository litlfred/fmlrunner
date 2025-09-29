package org.litlfred.fmlrunner.terminology

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

/**
 * FHIR ConceptMap resource definition for terminology translation
 * Based on FHIR R4 ConceptMap specification
 */
@Serializable
data class ConceptMap(
    val resourceType: String = "ConceptMap",
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
    val sourceUri: String? = null,
    val sourceCanonical: String? = null,
    val targetUri: String? = null,
    val targetCanonical: String? = null,
    val group: List<ConceptMapGroup>? = null
)

@Serializable
data class ConceptMapGroup(
    val source: String? = null,
    val sourceVersion: String? = null,
    val target: String? = null,
    val targetVersion: String? = null,
    val element: List<ConceptMapGroupElement>? = null,
    val unmapped: ConceptMapGroupUnmapped? = null
)

@Serializable
data class ConceptMapGroupElement(
    val code: String? = null,
    val display: String? = null,
    val target: List<ConceptMapGroupElementTarget>? = null
)

@Serializable
data class ConceptMapGroupElementTarget(
    val code: String? = null,
    val display: String? = null,
    val equivalence: String, // relatedto | equivalent | equal | wider | subsumes | narrower | specializes | inexact | unmatched | disjoint
    val comment: String? = null,
    val dependsOn: List<ConceptMapGroupElementTargetDependsOn>? = null,
    val product: List<ConceptMapGroupElementTargetDependsOn>? = null
)

@Serializable
data class ConceptMapGroupElementTargetDependsOn(
    val property: String,
    val system: String? = null,
    val value: String,
    val display: String? = null
)

@Serializable
data class ConceptMapGroupUnmapped(
    val mode: String, // provided | fixed | other-map
    val code: String? = null,
    val display: String? = null,
    val url: String? = null
)

// Supporting FHIR types
@Serializable
data class Identifier(
    val use: String? = null,
    val type: CodeableConcept? = null,
    val system: String? = null,
    val value: String? = null,
    val period: Period? = null,
    val assigner: Reference? = null
)

@Serializable
data class ContactDetail(
    val name: String? = null,
    val telecom: List<ContactPoint>? = null
)

@Serializable
data class ContactPoint(
    val system: String? = null, // phone | fax | email | pager | url | sms | other
    val value: String? = null,
    val use: String? = null, // home | work | temp | old | mobile
    val rank: Int? = null,
    val period: Period? = null
)

@Serializable
data class UsageContext(
    val code: Coding,
    val valueCodeableConcept: CodeableConcept? = null,
    val valueQuantity: Quantity? = null,
    val valueRange: Range? = null,
    val valueReference: Reference? = null
)

@Serializable
data class CodeableConcept(
    val coding: List<Coding>? = null,
    val text: String? = null
)

@Serializable
data class Coding(
    val system: String? = null,
    val version: String? = null,
    val code: String? = null,
    val display: String? = null,
    val userSelected: Boolean? = null
)

@Serializable
data class Period(
    val start: String? = null,
    val end: String? = null
)

@Serializable
data class Reference(
    val reference: String? = null,
    val type: String? = null,
    val identifier: Identifier? = null,
    val display: String? = null
)

@Serializable
data class Quantity(
    val value: Double? = null,
    val comparator: String? = null,
    val unit: String? = null,
    val system: String? = null,
    val code: String? = null
)

@Serializable
data class Range(
    val low: Quantity? = null,
    val high: Quantity? = null
)

/**
 * Result of concept translation operation
 */
@Serializable
data class TranslationResult(
    val system: String? = null,
    val code: String? = null,
    val display: String? = null,
    val equivalence: String
)

/**
 * ConceptMap Service using kotlin-fhir compatible types
 * This replaces the TypeScript ConceptMapService with a kotlin-fhir based implementation
 */
class ConceptMapService {
    private val conceptMaps = mutableMapOf<String, ConceptMap>()

    /**
     * Register a ConceptMap resource
     */
    fun registerConceptMap(conceptMap: ConceptMap) {
        conceptMap.id?.let { id ->
            conceptMaps[id] = conceptMap
        }
        conceptMap.url?.let { url ->
            conceptMaps[url] = conceptMap
        }
    }

    /**
     * Get ConceptMap by ID or URL
     */
    fun getConceptMap(reference: String): ConceptMap? {
        return conceptMaps[reference]
    }

    /**
     * Get all ConceptMaps
     */
    fun getAllConceptMaps(): List<ConceptMap> {
        val unique = mutableMapOf<String, ConceptMap>()
        conceptMaps.values.forEach { conceptMap ->
            val key = conceptMap.id ?: conceptMap.url ?: conceptMap.hashCode().toString()
            unique[key] = conceptMap
        }
        return unique.values.toList()
    }

    /**
     * Search ConceptMaps by parameters
     */
    fun searchConceptMaps(
        name: String? = null,
        status: String? = null,
        url: String? = null,
        source: String? = null,
        target: String? = null
    ): List<ConceptMap> {
        var results = getAllConceptMaps()

        name?.let { searchName ->
            results = results.filter { cm ->
                cm.name?.contains(searchName, ignoreCase = true) == true ||
                cm.title?.contains(searchName, ignoreCase = true) == true
            }
        }

        status?.let { searchStatus ->
            results = results.filter { it.status == searchStatus }
        }

        url?.let { searchUrl ->
            results = results.filter { it.url == searchUrl }
        }

        source?.let { searchSource ->
            results = results.filter { cm ->
                cm.sourceUri == searchSource || cm.sourceCanonical == searchSource
            }
        }

        target?.let { searchTarget ->
            results = results.filter { cm ->
                cm.targetUri == searchTarget || cm.targetCanonical == searchTarget
            }
        }

        return results
    }

    /**
     * Remove ConceptMap by ID or URL
     */
    fun removeConceptMap(reference: String): Boolean {
        return conceptMaps.remove(reference) != null
    }

    /**
     * Translate a code using ConceptMaps (kotlin-fhir compatible implementation)
     */
    fun translate(
        sourceSystem: String,
        sourceCode: String,
        targetSystem: String? = null
    ): List<TranslationResult> {
        val results = mutableListOf<TranslationResult>()

        // Find relevant ConceptMaps
        val relevantMaps = getAllConceptMaps().filter { cm ->
            val sourceMatch = cm.sourceUri == sourceSystem || cm.sourceCanonical == sourceSystem
            val targetMatch = targetSystem == null || cm.targetUri == targetSystem || cm.targetCanonical == targetSystem
            sourceMatch && targetMatch
        }

        // Search for translations
        for (conceptMap in relevantMaps) {
            conceptMap.group?.forEach { group ->
                if (group.source == sourceSystem || group.source == null) {
                    group.element?.forEach { element ->
                        if (element.code == sourceCode) {
                            element.target?.forEach { target ->
                                results.add(
                                    TranslationResult(
                                        system = targetSystem ?: group.target,
                                        code = target.code,
                                        display = target.display,
                                        equivalence = target.equivalence
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }

        return results
    }

    /**
     * Clear all ConceptMaps
     */
    fun clear() {
        conceptMaps.clear()
    }

    /**
     * Get count of registered ConceptMaps
     */
    fun getCount(): Int {
        return getAllConceptMaps().size
    }
}