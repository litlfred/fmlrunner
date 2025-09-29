#!/usr/bin/env node

/**
 * Import test data from ahdis/matchbox repository
 * Adds Apache 2.0 license and attribution headers to all imported files
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// GitHub API configuration
const MATCHBOX_API_BASE = 'https://api.github.com/repos/ahdis/matchbox';
const MATCHBOX_RAW_BASE = 'https://raw.githubusercontent.com/ahdis/matchbox/main';
const TEST_RESOURCES_PATH = 'matchbox-server/src/test/resources';

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../../input/examples/matchbox');

// Apache 2.0 License header template
const APACHE_LICENSE_HEADER = {
  json: `/*
 * Source: ahdis/matchbox repository
 * URL: https://github.com/ahdis/matchbox/tree/main/matchbox-server/src/test/resources
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
  map: `//
// Source: ahdis/matchbox repository
// URL: https://github.com/ahdis/matchbox/tree/main/matchbox-server/src/test/resources
// License: Apache License 2.0
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

`,
  xml: `<!--
Source: ahdis/matchbox repository
URL: https://github.com/ahdis/matchbox/tree/main/matchbox-server/src/test/resources
License: Apache License 2.0

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
  const url = `${MATCHBOX_API_BASE}/contents/${TEST_RESOURCES_PATH}${apiPath}`;
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
  const url = `${MATCHBOX_RAW_BASE}/${TEST_RESOURCES_PATH}${filePath}`;
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
  const header = APACHE_LICENSE_HEADER[extension] || APACHE_LICENSE_HEADER.map;
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
      
      // Only process .map, .json, and .xml files
      if (['map', 'json', 'xml'].includes(extension)) {
        const content = await downloadFile(filePath);
        if (content) {
          const baseName = path.basename(item.name, path.extname(item.name));
          const testCaseGroup = getTestCaseGroup(baseName);
          
          if (!testCases.has(testCaseGroup)) {
            testCases.set(testCaseGroup, { map: null, input: null, output: null, basePath: dirPath });
          }
          
          const testCase = testCases.get(testCaseGroup);
          if (item.name.includes('-map.') || item.name.endsWith('.map')) {
            testCase.map = { name: item.name, content, path: filePath };
          } else if (item.name.includes('-input.')) {
            testCase.input = { name: item.name, content, path: filePath };
          } else if (item.name.includes('-output.') || item.name.includes('-expected.')) {
            testCase.output = { name: item.name, content, path: filePath };
          } else {
            // General file, treat as input for now
            testCase.input = { name: item.name, content, path: filePath };
          }
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
    .replace(/-expected$/, '');
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
async function importMatchboxTestData() {
  console.log('Starting import from ahdis/matchbox repository...');
  
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
    
    const groupDir = path.join(OUTPUT_DIR, groupName);
    const metadata = {
      name: groupName,
      files: {}
    };
    
    if (testCase.map) {
      const mapPath = path.join(groupDir, testCase.map.name);
      const extension = path.extname(testCase.map.name).slice(1);
      saveFile(testCase.map.content, mapPath, extension);
      metadata.files.map = path.relative(OUTPUT_DIR, mapPath);
    }
    
    if (testCase.input) {
      const inputPath = path.join(groupDir, testCase.input.name);
      const extension = path.extname(testCase.input.name).slice(1);
      saveFile(testCase.input.content, inputPath, extension);
      metadata.files.input = path.relative(OUTPUT_DIR, inputPath);
    }
    
    if (testCase.output) {
      const outputPath = path.join(groupDir, testCase.output.name);
      const extension = path.extname(testCase.output.name).slice(1);
      saveFile(testCase.output.content, outputPath, extension);
      metadata.files.output = path.relative(OUTPUT_DIR, outputPath);
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
  importMatchboxTestData().catch(console.error);
}

module.exports = { importMatchboxTestData };