package org.litlfred.fmlrunner

import org.litlfred.fmlrunner.types.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class FmlRunnerTest {
    
    @Test
    fun testFmlRunnerCreation() {
        val runner = FmlRunner()
        assertEquals(0, runner.getCount())
    }
    
    @Test
    fun testBasicFmlCompilation() {
        val runner = FmlRunner()
        val fmlContent = """
            map "http://example.org/StructureMap/Patient" = "PatientTransform"
            
            group main(source src, target tgt) {
              src.name -> tgt.fullName;
            }
        """.trimIndent()
        
        val result = runner.compileFml(fmlContent)
        assertTrue(result.success, "Compilation should succeed")
        assertTrue(result.structureMap != null, "StructureMap should be created")
        assertEquals("PatientTransform", result.structureMap?.name)
        assertEquals("http://example.org/StructureMap/Patient", result.structureMap?.url)
    }
    
    @Test
    fun testStructureMapExecution() {
        val runner = FmlRunner()
        
        // First, create and register a simple StructureMap
        val structureMap = StructureMap(
            url = "http://example.org/StructureMap/Test",
            name = "TestMap",
            status = StructureMapStatus.ACTIVE,
            group = listOf(
                StructureMapGroup(
                    name = "main",
                    input = listOf(
                        StructureMapGroupInput(name = "src", mode = InputMode.SOURCE),
                        StructureMapGroupInput(name = "tgt", mode = InputMode.TARGET)
                    ),
                    rule = listOf(
                        StructureMapGroupRule(
                            source = listOf(
                                StructureMapGroupRuleSource(context = "src", element = "name")
                            ),
                            target = listOf(
                                StructureMapGroupRuleTarget(
                                    context = "tgt", 
                                    contextType = ContextType.VARIABLE, 
                                    element = "fullName"
                                )
                            )
                        )
                    )
                )
            )
        )
        
        assertTrue(runner.registerStructureMap(structureMap), "StructureMap registration should succeed")
        
        // Test execution
        val inputData = """{"name": "John Doe", "active": true}"""
        val result = runner.executeStructureMap("http://example.org/StructureMap/Test", inputData)
        
        assertTrue(result.success, "Execution should succeed: ${result.errors}")
        assertTrue(result.result != null, "Result should be generated")
    }
    
    @Test
    fun testFhirPathExpressionEvaluation() {
        val runner = FmlRunner()
        val fmlContent = """
            map "http://example.org/StructureMap/FhirPath" = "FhirPathTest"
            
            group main(source src, target tgt) {
              src.name -> tgt.fullName;
              src.active -> tgt.isActive;
            }
        """.trimIndent()
        
        val compilationResult = runner.compileAndRegisterFml(fmlContent)
        assertTrue(compilationResult.success, "Compilation should succeed")
        
        val inputData = """{"name": "Jane Smith", "active": false}"""
        val result = runner.executeStructureMap("http://example.org/StructureMap/FhirPath", inputData)
        
        assertTrue(result.success, "Execution should succeed")
    }
}