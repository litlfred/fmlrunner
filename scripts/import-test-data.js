#!/usr/bin/env node

/**
 * Import Test Data Script
 * 
 * This script imports FML test cases from external repositories with proper license attribution.
 * Sources:
 * - ahdis/matchbox: Apache 2.0 license
 * - FHIR/fhir-test-cases: HL7 copyright license
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const TESTDATA_DIR = path.join(__dirname, '..', 'input', 'testdata');
const GITHUB_RAW = 'https://raw.githubusercontent.com';

// Source configurations
const SOURCES = {
  matchbox: {
    name: 'ahdis/matchbox',
    baseUrl: `${GITHUB_RAW}/ahdis/matchbox/main/matchbox-server/src/test/resources`,
    license: 'Apache 2.0',
    attribution: `/*
 * Source: https://github.com/ahdis/matchbox
 * License: Apache License 2.0
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

`,
    files: [
      // Will be populated by scanning the repository
    ]
  },
  fhirTestCases: {
    name: 'FHIR/fhir-test-cases',
    baseUrl: `${GITHUB_RAW}/FHIR/fhir-test-cases/main/r5/structure-mapping`,
    license: 'HL7 FHIR',
    attribution: `/*
 * Source: https://github.com/FHIR/fhir-test-cases/r5/structure-mapping
 * License: HL7 FHIR License
 * 
 * FHIR® is the registered trademark of HL7 and is used with the permission of HL7.
 * Use of the FHIR trademark does not constitute endorsement of this product by HL7.
 * 
 * This content is licensed under the Creative Commons "No Rights Reserved" (CC0) License.
 * You may copy, distribute, transmit and adapt the work without restriction.
 * 
 * See: https://github.com/FHIR/fhir-test-cases/blob/main/LICENSE.txt
 */

`
  }
};

/**
 * Download a file from a URL
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else if (response.statusCode === 404) {
        console.log(`File not found (404): ${url}`);
        resolve(); // Don't reject, just skip missing files
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
      }
    }).on('error', reject);
  });
}

/**
 * Add license attribution to a file
 */
function addLicenseAttribution(filePath, attribution) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if attribution already exists
  if (content.includes('Source:')) {
    return;
  }
  
  const attributedContent = attribution + content;
  fs.writeFileSync(filePath, attributedContent);
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Import test files from FHIR test cases
 */
async function importFhirTestCases() {
  console.log('Importing from FHIR/fhir-test-cases...');
  
  const fhirDir = path.join(TESTDATA_DIR, 'fhir-test-cases');
  ensureDir(fhirDir);
  
  // Common test file patterns in fhir-test-cases
  const testFiles = [
    'patient-simple-map.txt',
    'patient-simple-input.json',
    'patient-simple-output.json',
    'observation-map.txt',
    'observation-input.json', 
    'observation-output.json',
    'questionnaire-map.txt',
    'questionnaire-input.json',
    'questionnaire-output.json'
  ];
  
  for (const file of testFiles) {
    const url = `${SOURCES.fhirTestCases.baseUrl}/${file}`;
    const outputPath = path.join(fhirDir, file);
    
    try {
      await downloadFile(url, outputPath);
      if (fs.existsSync(outputPath)) {
        addLicenseAttribution(outputPath, SOURCES.fhirTestCases.attribution);
        console.log(`✓ Downloaded: ${file}`);
      }
    } catch (error) {
      console.log(`✗ Failed to download ${file}: ${error.message}`);
    }
  }
}

/**
 * Import test files from ahdis/matchbox
 */
async function importMatchboxTestCases() {
  console.log('Importing from ahdis/matchbox...');
  
  const matchboxDir = path.join(TESTDATA_DIR, 'matchbox');
  ensureDir(matchboxDir);
  
  // Common test file patterns in matchbox
  const testFiles = [
    'SimplePatientTransform.map',
    'SimplePatientTransform-input.json',
    'SimplePatientTransform-output.json',
    'PatientContactTransform.map',
    'PatientContactTransform-input.json',
    'PatientContactTransform-output.json'
  ];
  
  for (const file of testFiles) {
    const url = `${SOURCES.matchbox.baseUrl}/${file}`;
    const outputPath = path.join(matchboxDir, file);
    
    try {
      await downloadFile(url, outputPath);
      if (fs.existsSync(outputPath)) {
        addLicenseAttribution(outputPath, SOURCES.matchbox.attribution);
        console.log(`✓ Downloaded: ${file}`);
      }
    } catch (error) {
      console.log(`✗ Failed to download ${file}: ${error.message}`);
    }
  }
}

/**
 * Create example test cases for immediate use
 */
function createExampleTestCases() {
  console.log('Creating example test cases...');
  
  const exampleDir = path.join(TESTDATA_DIR, 'examples');
  ensureDir(exampleDir);
  
  // Create a simple patient mapping example
  const patientMap = `/*
 * Example Patient Transform Map
 * License: MIT (local example)
 */

map "http://example.org/StructureMap/PatientTransform" = "PatientTransform"

group main(source src, target tgt) {
  src.name -> tgt.name;
  src.active -> tgt.active;
  src.gender -> tgt.gender;
}
`;

  const patientInput = `/*
 * Example Patient Input
 * License: MIT (local example)
 */
{
  "resourceType": "Patient",
  "name": [
    {
      "family": "Doe",
      "given": ["John"]
    }
  ],
  "active": true,
  "gender": "male"
}
`;

  const patientOutput = `/*
 * Example Patient Expected Output
 * License: MIT (local example)
 */
{
  "resourceType": "Patient",
  "name": [
    {
      "family": "Doe", 
      "given": ["John"]
    }
  ],
  "active": true,
  "gender": "male"
}
`;

  fs.writeFileSync(path.join(exampleDir, 'patient-transform.map'), patientMap);
  fs.writeFileSync(path.join(exampleDir, 'patient-input.json'), patientInput);
  fs.writeFileSync(path.join(exampleDir, 'patient-output.json'), patientOutput);
  
  console.log('✓ Created example test cases');
}

/**
 * Main execution
 */
async function main() {
  console.log('FML Test Data Import Script');
  console.log('============================');
  
  ensureDir(TESTDATA_DIR);
  
  // Create examples first (always available)
  createExampleTestCases();
  
  // Try to import from external sources
  try {
    await importFhirTestCases();
  } catch (error) {
    console.log('Note: Could not import from FHIR test cases (network restrictions may apply)');
  }
  
  try {
    await importMatchboxTestCases();
  } catch (error) {
    console.log('Note: Could not import from Matchbox (network restrictions may apply)');
  }
  
  console.log('\nImport complete! Test data available in input/testdata/');
  console.log('All files include proper license attribution as required.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  downloadFile,
  addLicenseAttribution,
  importFhirTestCases,
  importMatchboxTestCases,
  createExampleTestCases
};