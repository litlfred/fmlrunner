#!/usr/bin/env node

/**
 * Explore Test Repositories Script
 * 
 * This script explores the actual structure of test repositories to find real test files
 * and update the import script with correct paths.
 */

const https = require('https');

/**
 * Fetch directory listing from GitHub API
 */
function fetchGitHubDirectory(owner, repo, path = '') {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'fmlrunner-test-import'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Find test files recursively
 */
async function findTestFiles(owner, repo, basePath, extensions = ['.map', '.json', '.xml']) {
  const testFiles = [];
  
  try {
    const contents = await fetchGitHubDirectory(owner, repo, basePath);
    
    for (const item of contents) {
      if (item.type === 'file') {
        const ext = item.name.substring(item.name.lastIndexOf('.'));
        if (extensions.includes(ext) || item.name.includes('test') || item.name.includes('example')) {
          testFiles.push({
            name: item.name,
            path: item.path,
            downloadUrl: item.download_url,
            size: item.size
          });
        }
      } else if (item.type === 'dir' && (item.name.includes('test') || item.name.includes('example') || item.name.includes('mapping'))) {
        // Recursively explore test/example directories
        const subFiles = await findTestFiles(owner, repo, item.path, extensions);
        testFiles.push(...subFiles);
      }
    }
  } catch (error) {
    console.log(`Could not explore ${owner}/${repo}/${basePath}: ${error.message}`);
  }
  
  return testFiles;
}

/**
 * Main exploration function
 */
async function exploreRepositories() {
  console.log('Exploring test repositories for FML test cases...\n');
  
  // Explore FHIR test cases
  console.log('=== FHIR/fhir-test-cases ===');
  try {
    const fhirFiles = await findTestFiles('FHIR', 'fhir-test-cases', 'r5/structure-mapping');
    console.log(`Found ${fhirFiles.length} potential test files:`);
    fhirFiles.slice(0, 10).forEach(file => {
      console.log(`  - ${file.name} (${file.size} bytes)`);
    });
    if (fhirFiles.length > 10) {
      console.log(`  ... and ${fhirFiles.length - 10} more files`);
    }
  } catch (error) {
    console.log(`Error exploring FHIR test cases: ${error.message}`);
  }
  
  console.log('\n=== ahdis/matchbox ===');
  try {
    const matchboxFiles = await findTestFiles('ahdis', 'matchbox', 'matchbox-server/src/test/resources');
    console.log(`Found ${matchboxFiles.length} potential test files:`);
    matchboxFiles.slice(0, 10).forEach(file => {
      console.log(`  - ${file.name} (${file.size} bytes)`);
    });
    if (matchboxFiles.length > 10) {
      console.log(`  ... and ${matchboxFiles.length - 10} more files`);
    }
  } catch (error) {
    console.log(`Error exploring Matchbox test cases: ${error.message}`);
  }
  
  console.log('\nExploration complete!');
  console.log('Use the found file names to update the import-test-data.js script with real file paths.');
}

if (require.main === module) {
  exploreRepositories().catch(console.error);
}