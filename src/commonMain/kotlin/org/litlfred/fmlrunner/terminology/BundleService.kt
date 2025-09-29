package org.litlfred.fmlrunner.terminology

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

/**
 * FHIR Bundle resource definition for batch processing
 * Based on FHIR R4 Bundle specification
 */
@Serializable
data class Bundle(
    val resourceType: String = "Bundle",
    val id: String? = null,
    val identifier: Identifier? = null,
    val type: String, // document | message | transaction | transaction-response | batch | batch-response | history | searchset | collection
    val timestamp: String? = null,
    val total: Int? = null,
    val link: List<BundleLink>? = null,
    val entry: List<BundleEntry>? = null,
    val signature: String? = null // Digital signature
)

@Serializable
data class BundleLink(
    val relation: String,
    val url: String
)

@Serializable
data class BundleEntry(
    val link: List<BundleLink>? = null,
    val fullUrl: String? = null,
    val resource: JsonElement? = null,
    val search: BundleEntrySearch? = null,
    val request: BundleEntryRequest? = null,
    val response: BundleEntryResponse? = null
)

@Serializable
data class BundleEntrySearch(
    val mode: String? = null, // match | include | outcome
    val score: Double? = null
)

@Serializable
data class BundleEntryRequest(
    val method: String, // GET | HEAD | POST | PUT | DELETE | PATCH
    val url: String,
    val ifNoneMatch: String? = null,
    val ifModifiedSince: String? = null,
    val ifMatch: String? = null,
    val ifNoneExist: String? = null
)

@Serializable
data class BundleEntryResponse(
    val status: String,
    val location: String? = null,
    val etag: String? = null,
    val lastModified: String? = null,
    val outcome: JsonElement? = null
)

/**
 * Result of Bundle processing operation
 */
@Serializable
data class BundleProcessingResult(
    val success: Boolean,
    val processed: ProcessedCounts,
    val errors: List<String> = emptyList(),
    val warnings: List<String> = emptyList()
)

@Serializable
data class ProcessedCounts(
    val structureMaps: Int = 0,
    val structureDefinitions: Int = 0,
    val conceptMaps: Int = 0,
    val valueSets: Int = 0,
    val codeSystems: Int = 0,
    val other: Int = 0
)

/**
 * Bundle processing statistics
 */
@Serializable
data class BundleStats(
    val totalBundles: Int = 0,
    val totalResources: Int = 0,
    val resourceCounts: Map<String, Int> = emptyMap(),
    val lastProcessed: String? = null
)

/**
 * Bundle Service using kotlin-fhir compatible types
 * This replaces the TypeScript BundleService with a kotlin-fhir based implementation
 */
class BundleService(
    private val conceptMapService: ConceptMapService,
    private val valueSetService: ValueSetService,
    private val codeSystemService: CodeSystemService,
    private val validationService: ValidationService
) {
    private var stats = BundleStats()
    private val resourceCounts = mutableMapOf<String, Int>()

    /**
     * Process a Bundle and distribute resources to appropriate services
     */
    fun processBundle(bundle: Bundle): BundleProcessingResult {
        val errors = mutableListOf<String>()
        val warnings = mutableListOf<String>()
        val processed = ProcessedCounts()

        try {
            val entries = bundle.entry ?: emptyList()
            var processedCounts = ProcessedCounts()

            for (entry in entries) {
                val resource = entry.resource
                if (resource != null) {
                    val result = processResource(resource)
                    processedCounts = processedCounts.copy(
                        structureMaps = processedCounts.structureMaps + result.structureMaps,
                        structureDefinitions = processedCounts.structureDefinitions + result.structureDefinitions,
                        conceptMaps = processedCounts.conceptMaps + result.conceptMaps,
                        valueSets = processedCounts.valueSets + result.valueSets,
                        codeSystems = processedCounts.codeSystems + result.codeSystems,
                        other = processedCounts.other + result.other
                    )
                }
            }

            // Update statistics
            updateStats(bundle, processedCounts)

            return BundleProcessingResult(
                success = errors.isEmpty(),
                processed = processedCounts,
                errors = errors,
                warnings = warnings
            )

        } catch (e: Exception) {
            errors.add("Bundle processing failed: ${e.message}")
            return BundleProcessingResult(
                success = false,
                processed = ProcessedCounts(),
                errors = errors,
                warnings = warnings
            )
        }
    }

    /**
     * Process a single resource and route to appropriate service
     */
    private fun processResource(resource: JsonElement): ProcessedCounts {
        if (resource !is JsonObject) {
            return ProcessedCounts(other = 1)
        }

        val resourceType = resource["resourceType"]?.jsonPrimitive?.content
        
        return when (resourceType) {
            "ConceptMap" -> {
                try {
                    val conceptMap = Json.decodeFromJsonElement<ConceptMap>(resource)
                    conceptMapService.registerConceptMap(conceptMap)
                    ProcessedCounts(conceptMaps = 1)
                } catch (e: Exception) {
                    ProcessedCounts(other = 1)
                }
            }
            "ValueSet" -> {
                try {
                    val valueSet = Json.decodeFromJsonElement<ValueSet>(resource)
                    valueSetService.registerValueSet(valueSet)
                    ProcessedCounts(valueSets = 1)
                } catch (e: Exception) {
                    ProcessedCounts(other = 1)
                }
            }
            "CodeSystem" -> {
                try {
                    val codeSystem = Json.decodeFromJsonElement<CodeSystem>(resource)
                    codeSystemService.registerCodeSystem(codeSystem)
                    ProcessedCounts(codeSystems = 1)
                } catch (e: Exception) {
                    ProcessedCounts(other = 1)
                }
            }
            "StructureDefinition" -> {
                try {
                    val structureDefinition = Json.decodeFromJsonElement<StructureDefinition>(resource)
                    validationService.registerStructureDefinition(structureDefinition)
                    ProcessedCounts(structureDefinitions = 1)
                } catch (e: Exception) {
                    ProcessedCounts(other = 1)
                }
            }
            "StructureMap" -> {
                // StructureMap processing would be handled by the main FmlRunner
                ProcessedCounts(structureMaps = 1)
            }
            else -> {
                ProcessedCounts(other = 1)
            }
        }
    }

    /**
     * Update processing statistics
     */
    private fun updateStats(bundle: Bundle, processed: ProcessedCounts) {
        val totalResources = (bundle.entry?.size ?: 0)
        
        stats = stats.copy(
            totalBundles = stats.totalBundles + 1,
            totalResources = stats.totalResources + totalResources,
            lastProcessed = kotlinx.datetime.Clock.System.now().toString()
        )

        // Update resource counts
        resourceCounts["ConceptMap"] = (resourceCounts["ConceptMap"] ?: 0) + processed.conceptMaps
        resourceCounts["ValueSet"] = (resourceCounts["ValueSet"] ?: 0) + processed.valueSets
        resourceCounts["CodeSystem"] = (resourceCounts["CodeSystem"] ?: 0) + processed.codeSystems
        resourceCounts["StructureDefinition"] = (resourceCounts["StructureDefinition"] ?: 0) + processed.structureDefinitions
        resourceCounts["StructureMap"] = (resourceCounts["StructureMap"] ?: 0) + processed.structureMaps
        resourceCounts["Other"] = (resourceCounts["Other"] ?: 0) + processed.other

        stats = stats.copy(resourceCounts = resourceCounts.toMap())
    }

    /**
     * Get Bundle processing statistics
     */
    fun getStats(): BundleStats {
        return stats
    }

    /**
     * Clear all processed resources and reset statistics
     */
    fun clear() {
        conceptMapService.clear()
        valueSetService.clear()
        codeSystemService.clear()
        validationService.clear()
        resourceCounts.clear()
        stats = BundleStats()
    }

    /**
     * Get count of processed resources by type
     */
    fun getResourceCount(resourceType: String): Int {
        return resourceCounts[resourceType] ?: 0
    }

    /**
     * Get total count of processed resources
     */
    fun getTotalResourceCount(): Int {
        return resourceCounts.values.sum()
    }
}