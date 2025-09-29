// FHIR Mapping Language (FML) Execution Validation Test Plan
// This TestPlan validates FML execution using real-world test cases
// sourced from community FML projects with proper license compliance
// 
// Generated on: 2025-09-29T18:07:19.558Z

Instance: FMLExecutionValidationTestPlan
InstanceOf: TestPlan
Usage: #definition
* id = "fml-execution-validation"
* name = "FMLExecutionValidationTestPlan"
* title = "FHIR Mapping Language Execution Validation Test Plan"
* status = #draft
* version = "0.1.0"
* publisher = "FML Runner Project"
* description = "A comprehensive test suite for validating FML execution using real-world test cases sourced from ahdis/matchbox and FHIR/fhir-test-cases repositories"


* testCase[+]
  * id = "matchbox-qr2patgender"
  * sequence = 1
  * scope[+]
    * artifact = Reference(StructureMap/qr2patgender)
  * testRun[+]
    * narrative = "Test qr2patgender mapping from ahdis/matchbox"
    * script
      * language = #application/fhir+json
      * sourceReference = Reference(qr2patgender-input)
    * testData[+]
      * type = #input
      * content = Reference(qr2patgender-input)
    * testData[+]
      * type = #output
      * content = Reference(qr2patgender-output)
    * assertion[+]
      * type = #response
      * direction = #response
      * expression = "Bundle.entry.exists() or Patient.exists() or QuestionnaireResponse.exists()"
      * description = "Verify transformation produced valid output"

* testCase[+]
  * id = "fhir-tutorial-step1"
  * sequence = 2
  * scope[+]
    * artifact = Reference(StructureMap/tutorial-step1)
  * testRun[+]
    * narrative = "Test tutorial-step1 mapping from FHIR/fhir-test-cases"
    * script
      * language = #application/fhir+json
      * sourceReference = Reference(tutorial-step1-input)
    * testData[+]
      * type = #input
      * content = Reference(tutorial-step1-input)

// Total test cases: 2
// Matchbox test cases: 1
// FHIR test cases: 1
