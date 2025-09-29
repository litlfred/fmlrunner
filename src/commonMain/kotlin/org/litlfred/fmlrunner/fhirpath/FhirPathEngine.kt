package org.litlfred.fmlrunner.fhirpath

import kotlinx.serialization.json.*

/**
 * Cross-platform FHIRPath engine interface
 * Provides basic FHIRPath evaluation functionality
 */
interface FhirPathEngine {
    fun evaluate(context: JsonElement, expression: String): List<JsonElement>
    fun evaluateFirst(context: JsonElement, expression: String): JsonElement?
}

/**
 * Platform-specific factory function to create the appropriate FHIRPath engine
 * This will be implemented differently for each platform
 */
expect fun createFhirPathEngine(): FhirPathEngine

/**
 * Basic FHIRPath engine implementation for common use cases
 * This provides a subset of FHIRPath functionality sufficient for basic StructureMap execution
 */
class BasicFhirPathEngine : FhirPathEngine {
    
    override fun evaluate(context: JsonElement, expression: String): List<JsonElement> {
        return try {
            val results = mutableListOf<JsonElement>()
            val result = evaluateExpression(context, expression)
            if (result != JsonNull) {
                results.add(result)
            }
            results
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    override fun evaluateFirst(context: JsonElement, expression: String): JsonElement? {
        return evaluate(context, expression).firstOrNull()
    }
    
    /**
     * Basic expression evaluation supporting common FHIRPath patterns
     */
    private fun evaluateExpression(context: JsonElement, expression: String): JsonElement {
        val trimmedExpression = expression.trim()
        
        return when {
            // String literals
            trimmedExpression.startsWith("'") && trimmedExpression.endsWith("'") -> {
                JsonPrimitive(trimmedExpression.substring(1, trimmedExpression.length - 1))
            }
            
            // Number literals
            trimmedExpression.matches(Regex("\\d+(\\.\\d+)?")) -> {
                val number = trimmedExpression.toDoubleOrNull()
                if (number != null) {
                    if (number == number.toInt().toDouble()) {
                        JsonPrimitive(number.toInt())
                    } else {
                        JsonPrimitive(number)
                    }
                } else {
                    JsonNull
                }
            }
            
            // Boolean literals
            trimmedExpression == "true" -> JsonPrimitive(true)
            trimmedExpression == "false" -> JsonPrimitive(false)
            
            // Simple property access (e.g., "name", "active")
            trimmedExpression.matches(Regex("\\w+")) -> {
                extractProperty(context, trimmedExpression)
            }
            
            // Dot notation (e.g., "patient.name", "address.city")
            trimmedExpression.contains(".") -> {
                evaluateDotNotation(context, trimmedExpression)
            }
            
            // Array access (e.g., "name[0]", "telecom[0].value")
            trimmedExpression.contains("[") && trimmedExpression.contains("]") -> {
                evaluateArrayAccess(context, trimmedExpression)
            }
            
            // Function calls (basic support for common functions)
            trimmedExpression.contains("(") && trimmedExpression.contains(")") -> {
                evaluateFunction(context, trimmedExpression)
            }
            
            else -> JsonNull
        }
    }
    
    private fun extractProperty(element: JsonElement, property: String): JsonElement {
        return when (element) {
            is JsonObject -> element[property] ?: JsonNull
            is JsonArray -> {
                // For arrays, try to extract property from all elements
                val results = element.mapNotNull { item ->
                    extractProperty(item, property).takeIf { it != JsonNull }
                }
                if (results.size == 1) results[0] else JsonArray(results)
            }
            else -> JsonNull
        }
    }
    
    private fun evaluateDotNotation(context: JsonElement, expression: String): JsonElement {
        val parts = expression.split(".")
        var current = context
        
        for (part in parts) {
            current = extractProperty(current, part)
            if (current == JsonNull) break
        }
        
        return current
    }
    
    private fun evaluateArrayAccess(context: JsonElement, expression: String): JsonElement {
        // Parse expressions like "name[0]" or "telecom[0].value"
        val bracketStart = expression.indexOf("[")
        val bracketEnd = expression.indexOf("]")
        
        if (bracketStart == -1 || bracketEnd == -1 || bracketEnd <= bracketStart) {
            return JsonNull
        }
        
        val arrayPath = expression.substring(0, bracketStart)
        val indexStr = expression.substring(bracketStart + 1, bracketEnd)
        val remainingPath = if (bracketEnd + 1 < expression.length && expression[bracketEnd + 1] == '.') {
            expression.substring(bracketEnd + 2)
        } else ""
        
        // Get the array
        val arrayElement = if (arrayPath.isEmpty()) {
            context
        } else {
            evaluateDotNotation(context, arrayPath)
        }
        
        if (arrayElement !is JsonArray) {
            return JsonNull
        }
        
        // Get the index
        val index = indexStr.toIntOrNull() ?: return JsonNull
        if (index < 0 || index >= arrayElement.size) {
            return JsonNull
        }
        
        val selectedElement = arrayElement[index]
        
        // Apply remaining path if any
        return if (remainingPath.isEmpty()) {
            selectedElement
        } else {
            evaluateExpression(selectedElement, remainingPath)
        }
    }
    
    private fun evaluateFunction(context: JsonElement, expression: String): JsonElement {
        val parenStart = expression.indexOf("(")
        val parenEnd = expression.lastIndexOf(")")
        
        if (parenStart == -1 || parenEnd == -1 || parenEnd <= parenStart) {
            return JsonNull
        }
        
        val functionName = expression.substring(0, parenStart).trim()
        val argsStr = expression.substring(parenStart + 1, parenEnd).trim()
        val args = if (argsStr.isEmpty()) emptyList() else argsStr.split(",").map { it.trim() }
        
        return when (functionName) {
            "first" -> {
                when (context) {
                    is JsonArray -> if (context.isNotEmpty()) context[0] else JsonNull
                    else -> context
                }
            }
            
            "last" -> {
                when (context) {
                    is JsonArray -> if (context.isNotEmpty()) context[context.size - 1] else JsonNull
                    else -> context
                }
            }
            
            "count" -> {
                when (context) {
                    is JsonArray -> JsonPrimitive(context.size)
                    is JsonObject -> JsonPrimitive(context.size)
                    JsonNull -> JsonPrimitive(0)
                    else -> JsonPrimitive(1)
                }
            }
            
            "empty" -> {
                val isEmpty = when (context) {
                    is JsonArray -> context.isEmpty()
                    is JsonObject -> context.isEmpty()
                    JsonNull -> true
                    is JsonPrimitive -> context.content.isEmpty()
                    else -> false
                }
                JsonPrimitive(isEmpty)
            }
            
            "exists" -> {
                JsonPrimitive(context != JsonNull)
            }
            
            else -> JsonNull
        }
    }
}