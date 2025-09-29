package org.litlfred.fmlrunner

import org.litlfred.fmlrunner.types.*
import org.litlfred.fmlrunner.compiler.FmlCompiler
import org.litlfred.fmlrunner.executor.StructureMapExecutor

/**
 * Main FmlRunner class providing FML compilation and StructureMap execution
 * This is the core business logic that can be shared between Kotlin/JVM/Android and Node.js/JavaScript
 */
class FmlRunner {
    private val compiler = FmlCompiler()
    private val executor = StructureMapExecutor()
    private val structureMapStore = mutableMapOf<String, StructureMap>()

    /**
     * Compile FML content to StructureMap
     */
    fun compileFml(fmlContent: String): FmlCompilationResult {
        return compiler.compile(fmlContent)
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
    fun validateStructureMap(structureMap: StructureMap): ValidationResult {
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
}

/**
 * Validation result for StructureMap validation
 */
data class ValidationResult(
    val valid: Boolean,
    val errors: List<String>
)