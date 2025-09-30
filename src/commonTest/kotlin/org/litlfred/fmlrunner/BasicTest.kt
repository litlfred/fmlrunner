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
    
    @Test
    fun testValidFmlSyntaxValidation() {
        val runner = FmlRunner()
        val validFmlContent = """
            map "http://example.org/StructureMap/Patient" = "PatientTransform"
            
            group main(source src, target tgt) {
              src.name -> tgt.fullName;
              src.active -> tgt.isActive;
            }
        """.trimIndent()
        
        val result = runner.validateFmlSyntax(validFmlContent)
        assertTrue(result.valid, "Valid FML syntax should pass validation")
        assertTrue(result.errors.isEmpty(), "No errors should be reported for valid syntax")
    }
    
    @Test
    fun testInvalidFmlSyntaxValidation_MissingMapKeyword() {
        val runner = FmlRunner()
        val invalidFmlContent = """
            "http://example.org/StructureMap/Patient" = "PatientTransform"
            
            group main(source src, target tgt) {
              src.name -> tgt.fullName;
            }
        """.trimIndent()
        
        val result = runner.validateFmlSyntax(invalidFmlContent)
        assertTrue(!result.valid, "Invalid FML syntax should fail validation")
        assertTrue(result.errors.isNotEmpty(), "Errors should be reported for invalid syntax")
        assertTrue(result.errors.any { it.contains("map") || it.contains("Expected") }, 
                   "Error should mention missing 'map' keyword")
    }
    
    @Test
    fun testInvalidFmlSyntaxValidation_MalformedGroup() {
        val runner = FmlRunner()
        val invalidFmlContent = """
            map "http://example.org/StructureMap/Patient" = "PatientTransform"
            
            group main(source src, target tgt {
              src.name -> tgt.fullName;
            }
        """.trimIndent()
        
        val result = runner.validateFmlSyntax(invalidFmlContent)
        assertTrue(!result.valid, "Invalid FML syntax should fail validation")
        assertTrue(result.errors.isNotEmpty(), "Errors should be reported for malformed syntax")
    }
    
    @Test
    fun testInvalidFmlSyntaxValidation_EmptyContent() {
        val runner = FmlRunner()
        val emptyContent = ""
        
        val result = runner.validateFmlSyntax(emptyContent)
        assertTrue(!result.valid, "Empty content should fail validation")
        assertTrue(result.errors.isNotEmpty(), "Errors should be reported for empty content")
    }
    
    @Test
    fun testInvalidFmlSyntaxValidation_MissingClosingBrace() {
        val runner = FmlRunner()
        val invalidFmlContent = """
            map "http://example.org/StructureMap/Patient" = "PatientTransform"
            
            group main(source src, target tgt) {
              src.name -> tgt.fullName;
        """.trimIndent()
        
        val result = runner.validateFmlSyntax(invalidFmlContent)
        assertTrue(!result.valid, "Invalid FML syntax should fail validation")
        assertTrue(result.errors.isNotEmpty(), "Errors should be reported for missing closing brace")
    }
    
    @Test
    fun testComplexValidFmlSyntaxValidation() {
        val runner = FmlRunner()
        val complexValidFmlContent = """
            map "http://example.org/StructureMap/Complex" = "ComplexTransform"
            
            group main(source src, target tgt) {
              src.name -> tgt.fullName;
              src.active -> tgt.isActive;
              src.email -> tgt.contactEmail;
            }
        """.trimIndent()
        
        val result = runner.validateFmlSyntax(complexValidFmlContent)
        assertTrue(result.valid, "Complex valid FML syntax should pass validation")
        assertTrue(result.errors.isEmpty(), "No errors should be reported for complex valid syntax")
    }
}