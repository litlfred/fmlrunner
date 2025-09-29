package org.litlfred.fmlrunner

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class FmlRunnerJsTest {
    
    @Test
    fun testJsPlatform() {
        assertEquals("JavaScript", getPlatformName())
    }
    
    @Test
    fun testBasicFmlCompilation() {
        val runner = FmlRunner()
        val fml = """
            map "http://example.org/StructureMap/Test" = "TestMap"
            
            group main(source src, target tgt) {
                src.name -> tgt.fullName;
            }
        """.trimIndent()
        
        val result = runner.compileFml(fml)
        assertTrue(result.success, "FML compilation should succeed")
    }
}