#!/usr/bin/env node

/**
 * Demo script for FML Syntax Validation REST API
 * 
 * This script starts a REST API server and demonstrates the new syntax validation endpoint.
 * Run with: node demo-syntax-validation.js
 */

const express = require('express');
const { FmlRunner } = require('./packages/fmlrunner/dist/index.js');
const { FmlRunnerApi } = require('./packages/fmlrunner-rest/dist/api.js');

async function runDemo() {
  console.log('🚀 Starting FML Runner REST API Demo...\n');

  // Create FML Runner instance
  const fmlRunner = new FmlRunner({ 
    logLevel: 'info',
    validateInputOutput: true 
  });

  // Create and start API server
  const api = new FmlRunnerApi(fmlRunner);
  const app = api.getApp();
  
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`✅ FML Runner REST API started on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/health`);
    console.log(`🔍 Syntax Validation: POST http://localhost:${PORT}/api/v1/validate-syntax\n`);
    
    // Run demo tests
    setTimeout(() => runDemoTests(PORT), 1000);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });
}

async function runDemoTests(port) {
  console.log('🧪 Running Demo Tests...\n');

  const baseUrl = `http://localhost:${port}`;
  
  const testCases = [
    {
      name: '✅ Valid FML',
      fmlContent: `map "http://example.org/StructureMap/patient" = "PatientMap"

group main(source src : Patient, target tgt : Patient) {
  src.name -> tgt.name;
  src.birthDate -> tgt.birthDate;
}`
    },
    {
      name: '⚠️  Missing Map Declaration',
      fmlContent: `group main(source src : Patient, target tgt : Patient) {
  src.name -> tgt.name;
}`
    },
    {
      name: '❌ Empty Content',
      fmlContent: '   '
    },
    {
      name: '❌ Invalid Syntax',
      fmlContent: `map "http://example.org/StructureMap/test" = "TestMap"

group main(source src : Patient, target tgt : Patient {
  src.name -> tgt.name;
  // Missing closing parenthesis above
}`
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 ${testCase.name}:`);
    console.log(`Input: ${testCase.fmlContent.substring(0, 50).replace(/\n/g, '\\n')}${testCase.fmlContent.length > 50 ? '...' : ''}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/validate-syntax`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fmlContent: testCase.fmlContent })
      });

      const result = await response.json();
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (result.issue && result.issue.length > 0) {
        result.issue.forEach(issue => {
          const icon = issue.severity === 'error' ? '❌' : '⚠️';
          console.log(`${icon} ${issue.severity.toUpperCase()}: ${issue.diagnostics}`);
          if (issue.location) {
            console.log(`   📍 Location: ${issue.location[0]}`);
          }
        });
      } else {
        console.log('✅ No issues found');
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Demo completed! The server is still running.');
  console.log('💡 Try making your own requests to test the syntax validation:');
  console.log(`
curl -X POST ${baseUrl}/api/v1/validate-syntax \\
  -H "Content-Type: application/json" \\
  -d '{"fmlContent": "map \\"test\\" = \\"TestMap\\""}'
`);
  console.log('Press Ctrl+C to stop the server.\n');
}

// Simple fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = async (url, options = {}) => {
    const https = require('https');
    const http = require('http');
    const urlLib = require('url');
    
    return new Promise((resolve, reject) => {
      const parsedUrl = urlLib.parse(url);
      const lib = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = lib.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            json: () => Promise.resolve(JSON.parse(data))
          });
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  };
}

// Run the demo
runDemo().catch(console.error);