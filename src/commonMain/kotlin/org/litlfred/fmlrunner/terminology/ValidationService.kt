package org.litlfred.fmlrunner.terminology

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*

/**
 * FHIR StructureDefinition resource definition for resource validation
 * Based on FHIR R4 StructureDefinition specification
 */
@Serializable
data class StructureDefinition(
    val resourceType: String = "StructureDefinition",
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
    val keyword: List<Coding>? = null,
    val fhirVersion: String? = null,
    val kind: String, // primitive-type | complex-type | resource | logical
    val abstract: Boolean,
    val type: String,
    val baseDefinition: String? = null,
    val derivation: String? = null, // specialization | constraint
    val snapshot: StructureDefinitionSnapshot? = null,
    val differential: StructureDefinitionDifferential? = null
)

@Serializable
data class StructureDefinitionSnapshot(
    val element: List<ElementDefinition>
)

@Serializable
data class StructureDefinitionDifferential(
    val element: List<ElementDefinition>
)

@Serializable
data class ElementDefinition(
    val id: String? = null,
    val path: String,
    val representation: List<String>? = null,
    val sliceName: String? = null,
    val sliceIsConstraining: Boolean? = null,
    val label: String? = null,
    val code: List<Coding>? = null,
    val slicing: ElementDefinitionSlicing? = null,
    val short: String? = null,
    val definition: String? = null,
    val comment: String? = null,
    val requirements: String? = null,
    val alias: List<String>? = null,
    val min: Int? = null,
    val max: String? = null,
    val base: ElementDefinitionBase? = null,
    val contentReference: String? = null,
    val type: List<ElementDefinitionType>? = null,
    val defaultValueString: String? = null,
    val meaningWhenMissing: String? = null,
    val orderMeaning: String? = null,
    val fixedString: String? = null,
    val patternString: String? = null,
    val example: List<ElementDefinitionExample>? = null,
    val minValueInteger: Int? = null,
    val maxValueInteger: Int? = null,
    val maxLength: Int? = null,
    val condition: List<String>? = null,
    val constraint: List<ElementDefinitionConstraint>? = null,
    val mustSupport: Boolean? = null,
    val isModifier: Boolean? = null,
    val isModifierReason: String? = null,
    val isSummary: Boolean? = null,
    val binding: ElementDefinitionBinding? = null,
    val mapping: List<ElementDefinitionMapping>? = null
)

@Serializable
data class ElementDefinitionSlicing(
    val discriminator: List<ElementDefinitionSlicingDiscriminator>? = null,
    val description: String? = null,
    val ordered: Boolean? = null,
    val rules: String // closed | open | openAtEnd
)

@Serializable
data class ElementDefinitionSlicingDiscriminator(
    val type: String, // value | exists | pattern | type | profile
    val path: String
)

@Serializable
data class ElementDefinitionBase(
    val path: String,
    val min: Int,
    val max: String
)

@Serializable
data class ElementDefinitionType(
    val code: String,
    val profile: List<String>? = null,
    val targetProfile: List<String>? = null,
    val aggregation: List<String>? = null,
    val versioning: String? = null // either | independent | specific
)

@Serializable
data class ElementDefinitionExample(
    val label: String,
    val valueString: String? = null,
    val valueInteger: Int? = null,
    val valueBoolean: Boolean? = null
)

@Serializable
data class ElementDefinitionConstraint(
    val key: String,
    val requirements: String? = null,
    val severity: String, // error | warning
    val human: String,
    val expression: String? = null,
    val xpath: String? = null,
    val source: String? = null
)

@Serializable
data class ElementDefinitionBinding(
    val strength: String, // required | extensible | preferred | example
    val description: String? = null,
    val valueSet: String? = null
)

@Serializable
data class ElementDefinitionMapping(
    val identity: String,
    val language: String? = null,
    val map: String,
    val comment: String? = null
)

/**
 * Result of resource validation operation
 */
@Serializable
data class ResourceValidationResult(
    val valid: Boolean,
    val errors: List<String> = emptyList(),
    val warnings: List<String> = emptyList(),
    val profile: String? = null
)

/**
 * Validation Service using kotlin-fhir compatible types
 * This replaces the TypeScript ValidationService with a kotlin-fhir based implementation
 */
class ValidationService {
    private val structureDefinitions = mutableMapOf<String, StructureDefinition>()
    private val valueSetService = ValueSetService()
    private val codeSystemService = CodeSystemService()

    /**
     * Register a StructureDefinition for validation
     */
    fun registerStructureDefinition(structureDefinition: StructureDefinition) {
        structureDefinition.id?.let { id ->
            structureDefinitions[id] = structureDefinition
        }
        structureDefinition.url?.let { url ->
            structureDefinitions[url] = structureDefinition
        }
    }

    /**
     * Get StructureDefinition by ID or URL
     */
    fun getStructureDefinition(reference: String): StructureDefinition? {
        return structureDefinitions[reference]
    }

    /**
     * Validate a resource against a StructureDefinition
     */
    fun validateResource(
        resource: JsonElement,
        structureDefinition: StructureDefinition
    ): ResourceValidationResult {
        val errors = mutableListOf<String>()
        val warnings = mutableListOf<String>()

        try {
            // Basic structure validation
            if (resource !is JsonObject) {
                errors.add("Resource must be a JSON object")
                return ResourceValidationResult(
                    valid = false,
                    errors = errors,
                    profile = structureDefinition.url
                )
            }

            // Validate resource type
            val resourceType = resource["resourceType"]?.jsonPrimitive?.content
            if (resourceType != structureDefinition.type) {
                errors.add("Resource type '$resourceType' does not match StructureDefinition type '${structureDefinition.type}'")
            }

            // Validate elements using snapshot or differential
            val elements = structureDefinition.snapshot?.element 
                ?: structureDefinition.differential?.element 
                ?: emptyList()

            validateElements(resource, elements, errors, warnings)

        } catch (e: Exception) {
            errors.add("Validation error: ${e.message}")
        }

        return ResourceValidationResult(
            valid = errors.isEmpty(),
            errors = errors,
            warnings = warnings,
            profile = structureDefinition.url
        )
    }

    /**
     * Validate a resource against a profile URL
     */
    fun validateProfile(resource: JsonElement, profileUrl: String): ResourceValidationResult {
        val structureDefinition = getStructureDefinition(profileUrl)
        
        if (structureDefinition == null) {
            return ResourceValidationResult(
                valid = false,
                errors = listOf("StructureDefinition not found: $profileUrl"),
                profile = profileUrl
            )
        }

        return validateResource(resource, structureDefinition)
    }

    /**
     * Validate elements against ElementDefinitions
     */
    private fun validateElements(
        resource: JsonObject,
        elements: List<ElementDefinition>,
        errors: MutableList<String>,
        warnings: MutableList<String>
    ) {
        for (element in elements) {
            validateElement(resource, element, errors, warnings)
        }
    }

    /**
     * Validate a single element
     */
    private fun validateElement(
        resource: JsonObject,
        element: ElementDefinition,
        errors: MutableList<String>,
        warnings: MutableList<String>
    ) {
        val path = element.path
        val value = getValueAtPath(resource, path)

        // Check cardinality
        val min = element.min ?: 0
        val max = element.max ?: "*"

        when {
            value == null && min > 0 -> {
                errors.add("Required element '$path' is missing (min: $min)")
            }
            value is JsonArray && max != "*" -> {
                val maxCount = max.toIntOrNull() ?: Int.MAX_VALUE
                if (value.size > maxCount) {
                    errors.add("Element '$path' has too many values (max: $max, found: ${value.size})")
                }
            }
        }

        // Check data type
        element.type?.forEach { typeInfo ->
            if (value != null && !validateDataType(value, typeInfo.code)) {
                errors.add("Element '$path' has incorrect data type. Expected: ${typeInfo.code}")
            }
        }

        // Check binding
        element.binding?.let { binding ->
            if (value != null && binding.valueSet != null) {
                validateBinding(value, binding, path, errors, warnings)
            }
        }

        // Check constraints
        element.constraint?.forEach { constraint ->
            if (constraint.severity == "error" && !evaluateConstraint(resource, constraint)) {
                errors.add("Constraint violation for '$path': ${constraint.human}")
            } else if (constraint.severity == "warning" && !evaluateConstraint(resource, constraint)) {
                warnings.add("Constraint warning for '$path': ${constraint.human}")
            }
        }
    }

    /**
     * Get value at a specific path in the resource
     */
    private fun getValueAtPath(resource: JsonObject, path: String): JsonElement? {
        val parts = path.split(".")
        var current: JsonElement = resource

        for (part in parts.drop(1)) { // Skip resource type
            current = when (current) {
                is JsonObject -> current[part] ?: return null
                is JsonArray -> {
                    // For arrays, we'd need more sophisticated path handling
                    return null
                }
                else -> return null
            }
        }

        return current
    }

    /**
     * Validate data type
     */
    private fun validateDataType(value: JsonElement, expectedType: String): Boolean {
        return when (expectedType.lowercase()) {
            "string" -> value is JsonPrimitive && value.isString
            "integer" -> value is JsonPrimitive && value.content.toIntOrNull() != null
            "boolean" -> value is JsonPrimitive && value.booleanOrNull != null
            "decimal" -> value is JsonPrimitive && value.doubleOrNull != null
            "uri", "url", "canonical" -> value is JsonPrimitive && value.isString
            "code" -> value is JsonPrimitive && value.isString
            "id" -> value is JsonPrimitive && value.isString
            "markdown" -> value is JsonPrimitive && value.isString
            else -> true // Complex types validation requires additional logic
        }
    }

    /**
     * Validate binding to ValueSet
     */
    private fun validateBinding(
        value: JsonElement,
        binding: ElementDefinitionBinding,
        path: String,
        errors: MutableList<String>,
        warnings: MutableList<String>
    ) {
        val valueSetUrl = binding.valueSet ?: return
        
        // Extract code from value
        val code = when {
            value is JsonPrimitive && value.isString -> value.content
            value is JsonObject && value["code"] is JsonPrimitive -> value["code"]!!.jsonPrimitive.content
            else -> return
        }
        
        val validationResult = valueSetService.validateCode(code, valueSetUrl = valueSetUrl)
        
        if (!validationResult.result) {
            when (binding.strength) {
                "required" -> errors.add("Code '$code' at '$path' is not valid in required ValueSet '$valueSetUrl'")
                "extensible" -> warnings.add("Code '$code' at '$path' is not in extensible ValueSet '$valueSetUrl'")
                "preferred", "example" -> {} // No validation for preferred/example
            }
        }
    }

    /**
     * Evaluate constraint using FHIRPath expression
     */
    private fun evaluateConstraint(resource: JsonObject, constraint: ElementDefinitionConstraint): Boolean {
        // Basic constraint evaluation - checks if the constraint key exists in the expression
        val expression = constraint.expression ?: return true
        
        // Simple path evaluation for common patterns
        return when {
            expression.contains("exists()") -> {
                val path = expression.substringBefore(".exists()")
                resource.containsKey(path)
            }
            expression.contains("empty()") -> {
                val path = expression.substringBefore(".empty()")
                !resource.containsKey(path) || resource[path] is JsonNull
            }
            else -> true // Allow other expressions to pass
        }
    }

    /**
     * Clear all StructureDefinitions
     */
    fun clear() {
        structureDefinitions.clear()
    }

    /**
     * Get count of registered StructureDefinitions
     */
    fun getCount(): Int {
        return structureDefinitions.size
    }
}