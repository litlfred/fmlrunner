#!/usr/bin/env node

/**
 * Test Data Validation Script
 * 
 * Validates test data integrity and verifies that test case mappings are correct.
 */

const fs = require('fs');
const path = require('path');

const TESTDATA_DIR = path.join(__dirname, '..', 'input', 'testdata');
const MANIFEST_FILE = path.join(TESTDATA_DIR, 'test-manifest.json');

/**
 * Load and parse test manifest
 */
function loadTestManifest() {
  if (!fs.existsSync(MANIFEST_FILE)) {
    throw new Error(`Test manifest not found: ${MANIFEST_FILE}`);
  }
  
  const content = fs.readFileSync(MANIFEST_FILE, 'utf8');
  return JSON.parse(content);
}

/**
 * Validate a single test case
 */
function validateTestCase(testCase) {
  const errors = [];
  const warnings = [];
  
  console.log(`\nValidating test case: ${testCase.id}`);
  
  // Check if all referenced files exist
  const files = testCase.files;
  for (const [fileType, filePath] of Object.entries(files)) {
    const fullPath = path.join(TESTDATA_DIR, filePath);
    
    if (!fs.existsSync(fullPath)) {
      errors.push(`Missing ${fileType} file: ${filePath}`);
    } else {
      console.log(`  ✓ ${fileType}: ${filePath}`);
      
      // Check file content
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Verify license attribution exists
      if (!content.includes('License:') && !content.includes('Source:')) {
        warnings.push(`No license attribution found in ${filePath}`);
      }
      
      // Basic content validation
      if (fileType === 'input' || fileType === 'output') {
        try {
          JSON.parse(content);
          console.log(`    ✓ Valid JSON`);
        } catch (e) {
          errors.push(`Invalid JSON in ${filePath}: ${e.message}`);
        }
      }
      
      if (fileType === 'map') {
        if (!content.includes('map ') || !content.includes('group ')) {
          warnings.push(`${filePath} may not be a valid FML map (missing 'map' or 'group' keywords)`);
        } else {
          console.log(`    ✓ Contains FML structure`);
        }
      }
    }
  }
  
  return { errors, warnings };
}

/**
 * Validate file structure
 */
function validateFileStructure() {
  const errors = [];
  
  // Check main directories exist
  const requiredDirs = ['examples', 'fhir-test-cases', 'matchbox'];
  for (const dir of requiredDirs) {
    const dirPath = path.join(TESTDATA_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      errors.push(`Missing directory: ${dir}`);
    }
  }
  
  return errors;
}

/**
 * Generate validation report
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(50));
  console.log('VALIDATION REPORT');
  console.log('='.repeat(50));
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  results.forEach(result => {
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    
    if (result.errors.length > 0) {
      console.log(`\n❌ ERRORS for ${result.testCase}:`);
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS for ${result.testCase}:`);
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
  });
  
  console.log(`\nSUMMARY:`);
  console.log(`  Total test cases: ${results.length}`);
  console.log(`  Total errors: ${totalErrors}`);
  console.log(`  Total warnings: ${totalWarnings}`);
  
  if (totalErrors === 0) {
    console.log(`\n✅ All test cases validated successfully!`);
  } else {
    console.log(`\n❌ Validation failed with ${totalErrors} error(s)`);
  }
  
  return totalErrors === 0;
}

/**
 * Main validation function
 */
function validateTestData() {
  console.log('FML Test Data Validation');
  console.log('========================');
  
  try {
    // Validate file structure
    const structureErrors = validateFileStructure();
    if (structureErrors.length > 0) {
      console.log('\n❌ File structure errors:');
      structureErrors.forEach(error => console.log(`   - ${error}`));
      return false;
    }
    
    // Load test manifest
    const manifest = loadTestManifest();
    console.log(`\nLoaded test manifest: ${manifest.testManifest.name} v${manifest.testManifest.version}`);
    
    // Validate each test case
    const results = [];
    for (const testCase of manifest.testManifest.testCases) {
      const result = validateTestCase(testCase);
      results.push({
        testCase: testCase.id,
        errors: result.errors,
        warnings: result.warnings
      });
    }
    
    // Generate report
    return generateReport(results);
    
  } catch (error) {
    console.error(`Validation failed: ${error.message}`);
    return false;
  }
}

if (require.main === module) {
  const success = validateTestData();
  process.exit(success ? 0 : 1);
}

module.exports = {
  validateTestData,
  validateTestCase,
  loadTestManifest
};