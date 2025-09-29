#!/usr/bin/env node

/**
 * Simple validation script for the FML test suite
 * Validates JSON structure and file organization
 */

const fs = require('fs');
const path = require('path');

function validateJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function validateTestSuite() {
  console.log('FML Test Suite Validation');
  console.log('=========================\n');
  
  let errors = 0;
  let warnings = 0;
  
  // Check required files exist
  const requiredFiles = [
    'input/fsh/tests/FMLExecutionValidationTestPlan.fsh',
    'sushi-config.yaml',
    'input/examples/matchbox/test-cases-metadata.json',
    'input/examples/fhir-test-cases/test-cases-metadata.json'
  ];
  
  console.log('1. Checking required files...');
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✓ ${file}`);
    } else {
      console.log(`✗ ${file} - MISSING`);
      errors++;
    }
  }
  
  // Validate JSON files
  console.log('\n2. Validating JSON files...');
  const jsonFiles = [
    'input/examples/matchbox/test-cases-metadata.json',
    'input/examples/fhir-test-cases/test-cases-metadata.json',
    'input/examples/QuestionnaireResponse-qr-sample.json',
    'input/examples/Patient-patient-sample.json',
    'input/examples/Bundle-tutorial-input.json'
  ];
  
  for (const file of jsonFiles) {
    if (fs.existsSync(file)) {
      const result = validateJson(file);
      if (result.valid) {
        console.log(`✓ ${file}`);
      } else {
        console.log(`✗ ${file} - INVALID JSON: ${result.error}`);
        errors++;
      }
    } else {
      console.log(`⚠ ${file} - File not found`);
      warnings++;
    }
  }
  
  // Validate test case metadata structure
  console.log('\n3. Validating test case metadata...');
  try {
    const matchboxMetadata = JSON.parse(fs.readFileSync('input/examples/matchbox/test-cases-metadata.json', 'utf8'));
    const fhirMetadata = JSON.parse(fs.readFileSync('input/examples/fhir-test-cases/test-cases-metadata.json', 'utf8'));
    
    console.log(`✓ Matchbox test cases: ${matchboxMetadata.length}`);
    console.log(`✓ FHIR test cases: ${fhirMetadata.length}`);
    console.log(`✓ Total test cases: ${matchboxMetadata.length + fhirMetadata.length}`);
  } catch (error) {
    console.log(`✗ Error reading metadata: ${error.message}`);
    errors++;
  }
  
  // Check FSH file syntax (basic)
  console.log('\n4. Basic FSH syntax check...');
  try {
    const fshContent = fs.readFileSync('input/fsh/tests/FMLExecutionValidationTestPlan.fsh', 'utf8');
    if (fshContent.includes('Instance:') && fshContent.includes('InstanceOf: TestPlan')) {
      console.log('✓ FSH TestPlan structure looks valid');
    } else {
      console.log('⚠ FSH structure might be incomplete');
      warnings++;
    }
  } catch (error) {
    console.log(`✗ Error reading FSH file: ${error.message}`);
    errors++;
  }
  
  // Summary
  console.log('\n=========================');
  console.log('Validation Summary:');
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);
  
  if (errors === 0) {
    console.log('\n✓ Test suite structure is valid!');
    console.log('\nNext steps:');
    console.log('- Install SUSHI: npm install -g fsh-sushi');
    console.log('- Run SUSHI: sushi');
    console.log('- Import additional test data: npm run test-suite:import');
    return true;
  } else {
    console.log('\n✗ Test suite has validation errors!');
    return false;
  }
}

if (require.main === module) {
  const isValid = validateTestSuite();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateTestSuite };