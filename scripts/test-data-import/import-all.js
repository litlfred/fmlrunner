#!/usr/bin/env node

/**
 * Master script to import test data from both repositories
 * and generate updated FSH TestPlan files
 */

const { importMatchboxTestData } = require('./import-matchbox');
const { importFhirTestCases } = require('./import-fhir-test-cases');
const fs = require('fs');
const path = require('path');

async function generateTestPlan() {
  console.log('Generating updated TestPlan...');
  
  // Load metadata from both sources
  const matchboxMetadataPath = path.join(__dirname, '../../input/testdata/matchbox/test-cases-metadata.json');
  const fhirTestCasesMetadataPath = path.join(__dirname, '../../input/testdata/fhir-test-cases/test-cases-metadata.json');
  
  let matchboxTestCases = [];
  let fhirTestCases = [];
  
  if (fs.existsSync(matchboxMetadataPath)) {
    matchboxTestCases = JSON.parse(fs.readFileSync(matchboxMetadataPath, 'utf8'));
  }
  
  if (fs.existsSync(fhirTestCasesMetadataPath)) {
    fhirTestCases = JSON.parse(fs.readFileSync(fhirTestCasesMetadataPath, 'utf8'));
  }
  
  // Generate FSH TestPlan content
  let fshContent = `// FHIR Mapping Language (FML) Execution Validation Test Plan
// This TestPlan validates FML execution using real-world test cases
// sourced from community FML projects with proper license compliance
// 
// Generated on: ${new Date().toISOString()}

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

`;

  let sequenceCounter = 1;
  
  // Add test cases from matchbox
  for (const testCase of matchboxTestCases) {
    if (testCase.files.map && testCase.files.input) {
      fshContent += `
* testCase[+]
  * id = "matchbox-${testCase.name}"
  * sequence = ${sequenceCounter++}
  * scope[+]
    * artifact = Reference(StructureMap/${testCase.name})
  * testRun[+]
    * narrative = "Test ${testCase.name} mapping from ahdis/matchbox"
    * script
      * language = #application/fhir+json
      * sourceReference = Reference(${testCase.name}-input)
    * testData[+]
      * type = #input
      * content = Reference(${testCase.name}-input)
`;
      
      if (testCase.files.output) {
        fshContent += `    * testData[+]
      * type = #output
      * content = Reference(${testCase.name}-output)
    * assertion[+]
      * type = #response
      * direction = #response
      * expression = "Bundle.entry.exists() or Patient.exists() or QuestionnaireResponse.exists()"
      * description = "Verify transformation produced valid output"
`;
      }
    }
  }
  
  // Add test cases from FHIR test cases
  for (const testCase of fhirTestCases) {
    if (testCase.files.map && testCase.files.input) {
      fshContent += `
* testCase[+]
  * id = "fhir-${testCase.name}"
  * sequence = ${sequenceCounter++}
  * scope[+]
    * artifact = Reference(StructureMap/${testCase.name})
  * testRun[+]
    * narrative = "Test ${testCase.name} mapping from FHIR/fhir-test-cases"
    * script
      * language = #application/fhir+json
      * sourceReference = Reference(${testCase.name}-input)
    * testData[+]
      * type = #input
      * content = Reference(${testCase.name}-input)
`;
      
      if (testCase.files.output) {
        fshContent += `    * testData[+]
      * type = #output
      * content = Reference(${testCase.name}-output)
    * assertion[+]
      * type = #response
      * direction = #response
      * expression = "Bundle.entry.exists() or Patient.exists() or QuestionnaireResponse.exists()"
      * description = "Verify transformation produced valid output"
`;
      }
    }
  }
  
  fshContent += `
// Total test cases: ${matchboxTestCases.length + fhirTestCases.length}
// Matchbox test cases: ${matchboxTestCases.length}
// FHIR test cases: ${fhirTestCases.length}
`;
  
  // Save updated TestPlan
  const testPlanPath = path.join(__dirname, '../../input/fsh/tests/FMLExecutionValidationTestPlan.fsh');
  fs.writeFileSync(testPlanPath, fshContent, 'utf8');
  
  console.log(`Updated TestPlan saved to: ${testPlanPath}`);
  console.log(`Generated ${sequenceCounter - 1} test cases total`);
}

async function main() {
  console.log('Starting FML test data import process...');
  console.log('=====================================\n');
  
  try {
    // Import from matchbox
    console.log('1. Importing from ahdis/matchbox...');
    await importMatchboxTestData();
    
    console.log('\n2. Importing from FHIR/fhir-test-cases...');
    await importFhirTestCases();
    
    console.log('\n3. Generating updated TestPlan...');
    await generateTestPlan();
    
    console.log('\n=====================================');
    console.log('Import process completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review imported test data in input/testdata/');
    console.log('2. Review generated TestPlan in input/fsh/tests/');
    console.log('3. Run SUSHI to compile FSH files');
    console.log('4. Run FHIR IG Publisher to generate test suite');
    
  } catch (error) {
    console.error('Error during import process:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, generateTestPlan };