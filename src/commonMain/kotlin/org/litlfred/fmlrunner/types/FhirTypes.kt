package org.litlfred.fmlrunner.types

import kotlinx.serialization.Serializable

/**
 * Basic FHIR StructureMap types for cross-platform use
 */
@Serializable
data class StructureMap(
    val resourceType: String = "StructureMap",
    val id: String? = null,
    val url: String? = null,
    val name: String? = null,
    val title: String? = null,
    val status: StructureMapStatus,
    val experimental: Boolean? = null,
    val description: String? = null,
    val group: List<StructureMapGroup>
)

@Serializable
enum class StructureMapStatus {
    DRAFT, ACTIVE, RETIRED, UNKNOWN
}

@Serializable
data class StructureMapGroup(
    val name: String,
    val typeMode: TypeMode? = null,
    val documentation: String? = null,
    val input: List<StructureMapGroupInput>,
    val rule: List<StructureMapGroupRule>
)

@Serializable
enum class TypeMode {
    NONE, TYPES, TYPE_AND_TYPES
}

@Serializable
data class StructureMapGroupInput(
    val name: String,
    val type: String? = null,
    val mode: InputMode,
    val documentation: String? = null
)

@Serializable
enum class InputMode {
    SOURCE, TARGET
}

@Serializable
data class StructureMapGroupRule(
    val name: String? = null,
    val source: List<StructureMapGroupRuleSource>,
    val target: List<StructureMapGroupRuleTarget>? = null,
    val documentation: String? = null
)

@Serializable
data class StructureMapGroupRuleSource(
    val context: String,
    val element: String? = null,
    val variable: String? = null,
    val type: String? = null,
    val min: Int? = null,
    val max: String? = null
)

@Serializable
data class StructureMapGroupRuleTarget(
    val context: String? = null,
    val contextType: ContextType? = null,
    val element: String? = null,
    val variable: String? = null,
    val transform: String? = null,
    val parameter: List<String>? = null
)

@Serializable
enum class ContextType {
    VARIABLE, TYPE
}

/**
 * FML Compilation Result
 */
@Serializable
data class FmlCompilationResult(
    val success: Boolean,
    val structureMap: StructureMap? = null,
    val errors: List<String> = emptyList(),
    val warnings: List<String> = emptyList()
)

/**
 * Execution Result for StructureMap execution
 */
@Serializable
data class ExecutionResult(
    val success: Boolean,
    val result: String? = null, // JSON string for cross-platform compatibility
    val errors: List<String> = emptyList(),
    val warnings: List<String> = emptyList()
)

/**
 * Execution Options
 */
@Serializable
data class ExecutionOptions(
    val strictMode: Boolean = false,
    val validateInput: Boolean = true,
    val validateOutput: Boolean = true,
    val enableLogging: Boolean = false
)