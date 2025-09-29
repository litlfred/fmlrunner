package org.litlfred.fmlrunner.executor

import org.litlfred.fmlrunner.types.*
import kotlinx.serialization.json.*
// kotlin-fhirpath for FHIRPath evaluation from https://github.com/jingtang10/kotlin-fhirpath
// Note: JitPack access still blocked - will integrate when network firewall allows
// import com.github.jingtang10.kotlin.fhirpath.FHIRPathEngine
// import com.github.jingtang10.kotlin.fhirpath.FHIRPathEngineFactory

/**
 * StructureMap execution engine - executes StructureMaps on input data
 * Ready for kotlin-fhirpath library integration when network access allows
 */
class StructureMapExecutor {
    // kotlin-fhirpath engine integration ready when network allows
    // private val fhirPathEngine: FHIRPathEngine = FHIRPathEngineFactory.create()
    
    /**
     * Execute a StructureMap on input content
     */
    fun execute(structureMap: StructureMap, inputContent: String, options: ExecutionOptions = ExecutionOptions()): ExecutionResult {
        return try {
            // Basic validation
            if (structureMap.group.isEmpty()) {
                return ExecutionResult(
                    success = false,
                    errors = listOf("StructureMap must have at least one group")
                )
            }

            // Parse input JSON
            val json = Json { ignoreUnknownKeys = true }
            val inputData = json.parseToJsonElement(inputContent)

            // Execute the main group (first group by convention)
            val mainGroup = structureMap.group.first()
            val result = executeGroup(mainGroup, inputData, options)

            ExecutionResult(
                success = true,
                result = Json.encodeToString(JsonElement.serializer(), result)
            )
        } catch (e: Exception) {
            ExecutionResult(
                success = false,
                errors = listOf("Execution failed: ${e.message}")
            )
        }
    }

    /**
     * Execute a StructureMap group
     */
    private fun executeGroup(group: StructureMapGroup, inputData: JsonElement, options: ExecutionOptions): JsonElement {
        // Create target data structure
        val targetData = JsonObject(emptyMap()).toMutableMap()

        // Find source and target inputs
        val sourceInput = group.input.find { it.mode == InputMode.SOURCE }
        val targetInput = group.input.find { it.mode == InputMode.TARGET }

        if (sourceInput == null || targetInput == null) {
            throw IllegalArgumentException("Group must have both source and target inputs")
        }

        // Create execution context
        val context = ExecutionContext(
            sourceData = inputData,
            targetData = targetData,
            sourceContext = sourceInput.name,
            targetContext = targetInput.name
        )

        // Execute rules
        for (rule in group.rule) {
            executeRule(rule, context, options)
        }

        return JsonObject(targetData)
    }

    /**
     * Execute a single rule
     */
    private fun executeRule(rule: StructureMapGroupRule, context: ExecutionContext, options: ExecutionOptions) {
        // Process each source
        for (source in rule.source) {
            val sourceValue = extractSourceValue(source, context)
            
            // Process targets if available
            rule.target?.forEach { target ->
                applyTargetMapping(source, target, sourceValue, context, options)
            }
        }
    }

    /**
     * Extract value from source
     */
    private fun extractSourceValue(source: StructureMapGroupRuleSource, context: ExecutionContext): JsonElement? {
        return try {
            when {
                source.context == context.sourceContext && source.element != null -> {
                    // Extract from source data
                    extractElementValue(context.sourceData, source.element)
                }
                source.context == context.sourceContext && source.element == null -> {
                    // Use entire source
                    context.sourceData
                }
                else -> null
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Apply target mapping
     */
    private fun applyTargetMapping(
        source: StructureMapGroupRuleSource,
        target: StructureMapGroupRuleTarget,
        sourceValue: JsonElement?,
        context: ExecutionContext,
        options: ExecutionOptions
    ) {
        if (sourceValue == null) return

        val targetElement = target.element ?: return
        
        // Apply transformation if specified
        val transformedValue = if (target.transform != null) {
            applyTransform(target.transform, sourceValue, target.parameter)
        } else {
            sourceValue
        }

        // Set target value
        setTargetValue(context, targetElement, transformedValue)
    }

    /**
     * Extract element value from JSON
     */
    private fun extractElementValue(jsonElement: JsonElement, elementPath: String): JsonElement? {
        return when (jsonElement) {
            is JsonObject -> jsonElement[elementPath]
            is JsonArray -> {
                // Handle array access
                val index = elementPath.toIntOrNull()
                if (index != null && index < jsonElement.size) {
                    jsonElement[index]
                } else null
            }
            else -> null
        }
    }

    /**
     * Set target value in context
     */
    private fun setTargetValue(context: ExecutionContext, elementPath: String, value: JsonElement) {
        context.targetData[elementPath] = value
    }

    /**
     * Apply transformation function
     */
    private fun applyTransform(transform: String, value: JsonElement, parameters: List<String>?): JsonElement {
        return when (transform.lowercase()) {
            "copy" -> value
            "create" -> {
                // Create new object/value based on parameters
                parameters?.firstOrNull()?.let { type ->
                    when (type.lowercase()) {
                        "string" -> JsonPrimitive("")
                        "integer" -> JsonPrimitive(0)
                        "boolean" -> JsonPrimitive(false)
                        else -> JsonObject(emptyMap())
                    }
                } ?: value
            }
            "cast" -> {
                // Type casting
                parameters?.firstOrNull()?.let { targetType ->
                    castValue(value, targetType)
                } ?: value
            }
            "evaluate" -> {
                // Simple FHIRPath-like evaluation (basic implementation)
                parameters?.firstOrNull()?.let { expression ->
                    evaluateExpression(value, expression)
                } ?: value
            }
            else -> value // Unknown transform, return original value
        }
    }

    /**
     * Cast value to target type
     */
    private fun castValue(value: JsonElement, targetType: String): JsonElement {
        return when (targetType.lowercase()) {
            "string" -> JsonPrimitive(value.toString().trim('"'))
            "integer" -> {
                val stringValue = if (value is JsonPrimitive) value.content else value.toString()
                JsonPrimitive(stringValue.toIntOrNull() ?: 0)
            }
            "boolean" -> {
                val stringValue = if (value is JsonPrimitive) value.content else value.toString()
                JsonPrimitive(stringValue.toBooleanStrictOrNull() ?: false)
            }
            else -> value
        }
    }

    /**
     * Expression evaluation prepared for kotlin-fhirpath integration
     */
    private fun evaluateExpression(context: JsonElement, expression: String): JsonElement {
        return try {
            // Prepared for kotlin-fhirpath engine when network access allows
            // val contextString = context.toString()
            // val results = fhirPathEngine.evaluate(contextString, expression)
            // if (results.isNotEmpty()) {
            //     Json.parseToJsonElement(results.first().toString())
            // } else {
            //     JsonNull
            // }
            
            // Enhanced fallback evaluation with improved FHIRPath-like support
            when {
                expression.startsWith("'") && expression.endsWith("'") -> {
                    // String literal
                    JsonPrimitive(expression.substring(1, expression.length - 1))
                }
                expression.matches(Regex("\\d+")) -> {
                    // Number literal
                    JsonPrimitive(expression.toInt())
                }
                expression == "true" || expression == "false" -> {
                    // Boolean literal
                    JsonPrimitive(expression.toBoolean())
                }
                expression.contains(".") -> {
                    // Property access path
                    val parts = expression.split(".")
                    var current = context
                    for (part in parts) {
                        current = extractElementValue(current, part) ?: return JsonNull
                    }
                    current
                }
                else -> {
                    // Simple property access
                    extractElementValue(context, expression) ?: JsonNull
                }
            }
        } catch (e: Exception) {
            JsonNull
        }
    }

    /**
     * Validate StructureMap structure
     */
    fun validateStructureMap(structureMap: StructureMap): ValidationResult {
        val errors = mutableListOf<String>()

        if (structureMap.group.isEmpty()) {
            errors.add("StructureMap must have at least one group")
        }

        for ((index, group) in structureMap.group.withIndex()) {
            if (group.name.isBlank()) {
                errors.add("Group $index must have a name")
            }

            if (group.input.isEmpty()) {
                errors.add("Group '${group.name}' must have at least one input")
            }

            val sourceInputs = group.input.filter { it.mode == InputMode.SOURCE }
            val targetInputs = group.input.filter { it.mode == InputMode.TARGET }

            if (sourceInputs.isEmpty()) {
                errors.add("Group '${group.name}' must have at least one source input")
            }

            if (targetInputs.isEmpty()) {
                errors.add("Group '${group.name}' must have at least one target input")
            }

            if (group.rule.isEmpty()) {
                errors.add("Group '${group.name}' must have at least one rule")
            }

            for ((ruleIndex, rule) in group.rule.withIndex()) {
                if (rule.source.isEmpty()) {
                    errors.add("Rule $ruleIndex in group '${group.name}' must have at least one source")
                }
            }
        }

        return ValidationResult(
            valid = errors.isEmpty(),
            errors = errors
        )
    }
}

/**
 * Execution context for rule processing
 */
private data class ExecutionContext(
    val sourceData: JsonElement,
    val targetData: MutableMap<String, JsonElement>,
    val sourceContext: String,
    val targetContext: String
)

/**
 * Validation result
 */
data class ValidationResult(
    val valid: Boolean,
    val errors: List<String>
)