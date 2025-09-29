#!/usr/bin/env node

/**
 * Import test data from FHIR/fhir-test-cases repository
 * Adds HL7 copyright and attribution headers to all imported files
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// GitHub API configuration
const FHIR_TEST_CASES_API_BASE = 'https://api.github.com/repos/FHIR/fhir-test-cases';
const FHIR_TEST_CASES_RAW_BASE = 'https://raw.githubusercontent.com/FHIR/fhir-test-cases/main';
const STRUCTURE_MAPPING_PATH = 'r5/structure-mapping';

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../../input/testdata/fhir-test-cases');

// HL7 License header template
const HL7_LICENSE_HEADER = {
  json: `/*
 * Source: FHIR/fhir-test-cases repository
 * URL: https://github.com/FHIR/fhir-test-cases/tree/main/r5/structure-mapping
 * 
 * (c) 2011+ HL7 FHIR Project
 * 
 * Licensed under the HL7 FHIR License - see LICENSE.txt at the root of this repository.
 * The original content is licensed under the HL7 FHIR License.
 * 
 * This content contains test cases and mapping specifications from the 
 * official FHIR test suite, used here under the terms of the HL7 license
 * for testing and validation purposes.
 */

`,
  map: `//
// Source: FHIR/fhir-test-cases repository
// URL: https://github.com/FHIR/fhir-test-cases/tree/main/r5/structure-mapping
// 
// (c) 2011+ HL7 FHIR Project
// 
// Licensed under the HL7 FHIR License - see LICENSE.txt at the root of this repository.
// The original content is licensed under the HL7 FHIR License.
// 
// This content contains test cases and mapping specifications from the 
// official FHIR test suite, used here under the terms of the HL7 license
// for testing and validation purposes.
//

`,
  xml: `<!--
Source: FHIR/fhir-test-cases repository
URL: https://github.com/FHIR/fhir-test-cases/tree/main/r5/structure-mapping

(c) 2011+ HL7 FHIR Project

Licensed under the HL7 FHIR License - see LICENSE.txt at the root of this repository.
The original content is licensed under the HL7 FHIR License.

This content contains test cases and mapping specifications from the 
official FHIR test suite, used here under the terms of the HL7 license
for testing and validation purposes.
-->

`
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// Get repository contents recursively
async function getRepoContents(apiPath = '') {
  const url = `${FHIR_TEST_CASES_API_BASE}/contents/${STRUCTURE_MAPPING_PATH}${apiPath}`;
  console.log(`Fetching: ${url}`);
  
  try {
    const response = await makeRequest(url);
    return JSON.parse(response);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return [];
  }
}

// Download file content
async function downloadFile(filePath) {
  const url = `${FHIR_TEST_CASES_RAW_BASE}/${STRUCTURE_MAPPING_PATH}${filePath}`;
  console.log(`Downloading: ${url}`);
  
  try {
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    return null;
  }
}

// Add license header based on file extension
function addLicenseHeader(content, extension) {
  const header = HL7_LICENSE_HEADER[extension] || HL7_LICENSE_HEADER.map;
  return header + content;
}

// Process files recursively
async function processDirectory(dirPath = '', testCases = new Map()) {
  const contents = await getRepoContents(dirPath);
  
  for (const item of contents) {
    if (item.type === 'dir') {
      // Recursively process subdirectories
      await processDirectory(`${dirPath}/${item.name}`, testCases);
    } else if (item.type === 'file') {
      const filePath = `${dirPath}/${item.name}`;
      const extension = path.extname(item.name).slice(1);
      
      // Process relevant files (.map, .txt, .json, .xml, .fml)
      if (['map', 'txt', 'json', 'xml', 'fml'].includes(extension)) {
        const content = await downloadFile(filePath);
        if (content) {
          const baseName = path.basename(item.name, path.extname(item.name));
          const testCaseGroup = getTestCaseGroup(baseName);
          
          if (!testCases.has(testCaseGroup)) {
            testCases.set(testCaseGroup, { 
              map: null, 
              input: null, 
              output: null, 
              basePath: dirPath,
              files: []
            });
          }
          
          const testCase = testCases.get(testCaseGroup);
          const fileInfo = { name: item.name, content, path: filePath, extension };
          
          // Categorize files based on naming conventions
          if (item.name.includes('-map.') || item.name.endsWith('.map') || 
              item.name.endsWith('.fml') || item.name.endsWith('.txt')) {
            testCase.map = fileInfo;
          } else if (item.name.includes('-input.') || item.name.includes('source')) {
            testCase.input = fileInfo;
          } else if (item.name.includes('-output.') || item.name.includes('-expected.') || 
                     item.name.includes('target')) {
            testCase.output = fileInfo;
          }
          
          // Keep track of all files for manual inspection
          testCase.files.push(fileInfo);
        }
      }
    }
  }
  
  return testCases;
}

// Extract test case group name from filename
function getTestCaseGroup(baseName) {
  // Remove common suffixes to group related files
  return baseName
    .replace(/-map$/, '')
    .replace(/-input$/, '')
    .replace(/-output$/, '')
    .replace(/-expected$/, '')
    .replace(/-source$/, '')
    .replace(/-target$/, '');
}

// Save files with license headers
function saveFile(content, filePath, extension) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const contentWithHeader = addLicenseHeader(content, extension);
  fs.writeFileSync(filePath, contentWithHeader, 'utf8');
  console.log(`Saved: ${filePath}`);
}

// Main import function
async function importFhirTestCases() {
  console.log('Starting import from FHIR/fhir-test-cases repository...');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const testCases = await processDirectory();
  
  console.log(`\nFound ${testCases.size} test case groups:`);
  
  // Save grouped test cases
  const testCaseMetadata = [];
  
  for (const [groupName, testCase] of testCases) {
    console.log(`\nProcessing test case group: ${groupName}`);
    console.log(`  Files found: ${testCase.files.map(f => f.name).join(', ')}`);
    
    const groupDir = path.join(OUTPUT_DIR, groupName);
    const metadata = {
      name: groupName,
      files: {},
      allFiles: testCase.files.map(f => f.name)
    };
    
    // Save all files in the group
    for (const file of testCase.files) {
      const filePath = path.join(groupDir, file.name);
      saveFile(file.content, filePath, file.extension);
      
      // Categorize for metadata
      if (file === testCase.map) {
        metadata.files.map = path.relative(OUTPUT_DIR, filePath);
      } else if (file === testCase.input) {
        metadata.files.input = path.relative(OUTPUT_DIR, filePath);
      } else if (file === testCase.output) {
        metadata.files.output = path.relative(OUTPUT_DIR, filePath);
      }
    }
    
    testCaseMetadata.push(metadata);
  }
  
  // Save metadata file
  const metadataPath = path.join(OUTPUT_DIR, 'test-cases-metadata.json');
  const metadataContent = JSON.stringify(testCaseMetadata, null, 2);
  saveFile(metadataContent, metadataPath, 'json');
  
  console.log(`\nImport completed. Imported ${testCaseMetadata.length} test case groups.`);
  console.log(`Test data saved to: ${OUTPUT_DIR}`);
}

// Run the import if called directly
if (require.main === module) {
  importFhirTestCases().catch(console.error);
}

module.exports = { importFhirTestCases };