# FML Runner - Core Library

A Kotlin Multiplatform library for compiling and executing FHIR Mapping Language (FML) files to transform healthcare data using FHIR StructureMaps.

This package contains the JavaScript/Node.js distribution of the FML Runner core library, compiled from Kotlin using Kotlin/JS.

## Installation

```bash
npm install fmlrunner
```

## Usage

```javascript
// Import the FML Runner
const { FmlRunner } = require('fmlrunner');

// Create a new instance
const runner = new FmlRunner();

// Compile FML
const result = runner.compileFml(`
  map "http://example.org/StructureMap/Patient" = "PatientTransform"
  
  group main(source src, target tgt) {
    src.name -> tgt.fullName;
    src.active -> tgt.isActive;
  }
`);

// Execute transformation
const execResult = runner.executeStructureMap(
  "http://example.org/StructureMap/Patient",
  '{"name": "John Doe", "active": true}'
);
```

## Features

- **Cross-platform**: Works on Node.js and browsers
- **Type Safe**: Full TypeScript definitions included
- **FHIR Compliant**: Implements FHIR Mapping Language specification
- **High Performance**: Kotlin/JS compilation for optimal performance

## Documentation

For complete documentation, visit the [FML Runner GitHub repository](https://github.com/litlfred/fmlrunner).

## License

MIT License - see LICENSE file for details.