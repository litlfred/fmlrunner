// FML Execution Validation Test Plan
// Defines a comprehensive test suite for validating FML (FHIR Mapping Language) execution

Instance: FMLExecutionValidationTestPlan
InstanceOf: TestPlan
Usage: #example
Title: "FML Execution Validation Test Plan"
Description: "Comprehensive test plan for validating FML execution with real-world test cases from community FML projects"
* meta.versionId = "1.0.0"
* url = "http://litlfred.github.io/fmlrunner/TestPlan/FMLExecutionValidationTestPlan"
* identifier.value = "fml-execution-validation-test-plan"
* version = "1.0.0"
* name = "FMLExecutionValidationTestPlan"
* title = "FML Execution Validation Test Plan"
* status = #active
* experimental = false
* publisher = "FML Runner Project"
* contact.name = "FML Runner Development Team"
* contact.telecom.system = #url
* contact.telecom.value = "https://github.com/litlfred/fmlrunner"
* description = "This test plan validates FML execution capabilities using test cases sourced from community FML projects including ahdis/matchbox and FHIR/fhir-test-cases repositories. Each test case validates the complete FML transformation pipeline from input data through map execution to expected output validation."

* purpose = "Ensure FML execution engine correctly transforms input data according to mapping specifications and produces expected outputs that conform to FHIR resource definitions."

* scope.artifact = "http://hl7.org/fhir/StructureDefinition/StructureMap"
* scope.conformance.requirements = "Validate that FML execution produces outputs that match expected results for known test cases"

// Test Case 1: Basic Patient Transform
* testCase[0].id = "patient-basic-transform"
* testCase[0].sequence = 1
* testCase[0].scope.artifact = "http://example.org/StructureMap/PatientTransform"
* testCase[0].scope.phase = #unit-test
* testCase[0].requirement.linkId = "REQ-001"
* testCase[0].requirement.description = "Basic patient data transformation using FML mapping"

* testCase[0].testRun[0].id = "patient-basic-transform-run"
* testCase[0].testRun[0].description = "Execute patient transform with valid input and validate output"

// Test Data References
* testCase[0].testData[0].id = "patient-transform-map"
* testCase[0].testData[0].description = "Patient transformation mapping file"
* testCase[0].testData[0].type = #test-data
* testCase[0].testData[0].content.sourceAttachment.url = "testdata/examples/patient-transform.map"
* testCase[0].testData[0].content.sourceAttachment.contentType = "text/plain"

* testCase[0].testData[1].id = "patient-input-data"
* testCase[0].testData[1].description = "Input patient data for transformation"
* testCase[0].testData[1].type = #test-data
* testCase[0].testData[1].content.sourceAttachment.url = "testdata/examples/patient-input.json"
* testCase[0].testData[1].content.sourceAttachment.contentType = "application/fhir+json"

* testCase[0].testData[2].id = "patient-expected-output"
* testCase[0].testData[2].description = "Expected output after patient transformation"
* testCase[0].testData[2].type = #test-data
* testCase[0].testData[2].content.sourceAttachment.url = "testdata/examples/patient-output.json"
* testCase[0].testData[2].content.sourceAttachment.contentType = "application/fhir+json"

// Additional test cases can be added here for:
// - Complex transformations with nested data
// - Error handling scenarios
// - Performance testing with large datasets
// - Terminology-aware transformations using ConceptMaps
// - Test cases from imported external repositories

// Test Case 2: Basic Observation Transform
* testCase[1].id = "observation-basic-transform"
* testCase[1].sequence = 2
* testCase[1].scope.artifact = "http://example.org/StructureMap/ObservationTransform"
* testCase[1].scope.phase = #unit-test
* testCase[1].requirement.linkId = "REQ-002"
* testCase[1].requirement.description = "Basic observation data transformation using FML mapping"

* testCase[1].testRun[0].id = "observation-basic-transform-run"
* testCase[1].testRun[0].description = "Execute observation transform with valid input and validate output"

// Test Data References for Observation
* testCase[1].testData[0].id = "observation-transform-map"
* testCase[1].testData[0].description = "Observation transformation mapping file"
* testCase[1].testData[0].type = #test-data
* testCase[1].testData[0].content.sourceAttachment.url = "testdata/examples/observation-transform.map"
* testCase[1].testData[0].content.sourceAttachment.contentType = "text/plain"

* testCase[1].testData[1].id = "observation-input-data"
* testCase[1].testData[1].description = "Input observation data for transformation"
* testCase[1].testData[1].type = #test-data
* testCase[1].testData[1].content.sourceAttachment.url = "testdata/examples/observation-input.json"
* testCase[1].testData[1].content.sourceAttachment.contentType = "application/fhir+json"

* testCase[1].testData[2].id = "observation-expected-output"
* testCase[1].testData[2].description = "Expected output after observation transformation"
* testCase[1].testData[2].type = #test-data
* testCase[1].testData[2].content.sourceAttachment.url = "testdata/examples/observation-output.json"
* testCase[1].testData[2].content.sourceAttachment.contentType = "application/fhir+json"

// Additional test cases can be added here for:
// - Complex transformations with nested data
// - Error handling scenarios
// - Performance testing with large datasets
// - Terminology-aware transformations using ConceptMaps
// - Test cases from imported external repositories

// Dependency on FHIR R5 StructureMap specification
* dependency[0].description = "FHIR R5 StructureMap Resource"
* dependency[0].predecessor = "http://hl7.org/fhir/5.0.0/StructureDefinition/StructureMap"