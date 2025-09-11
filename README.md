# FML Runner

A Node.js library for compiling and executing FHIR Mapping Language (FML) files to transform healthcare data using FHIR StructureMaps.

## Overview

FML Runner is designed as a library component for larger application frameworks, providing comprehensive functionality to:

1. **Compile** FHIR Mapping Language (FML) content into FHIR StructureMap resources (JSON format)
2. **Execute** StructureMaps on input content to perform data transformations
3. **Manage** FHIR terminology resources (ConceptMaps, ValueSets, CodeSystems, StructureDefinitions)
4. **Process** FHIR Bundles for bulk resource operations
5. **Provide** REST API endpoints with FHIR-compliant CRUD operations
6. **Optimize** performance with intelligent caching and FHIRPath integration

## Installation

### Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher

### Install from npm (Production)

```bash
npm install fml-runner
```

### Install from Source (Development)

```bash
# Clone the repository
git clone https://github.com/litlfred/fmlrunner.git
cd fmlrunner

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Quick Start

#### Library Usage

```javascript
import { FmlRunner } from 'fml-runner';

const runner = new FmlRunner();

// Compile FML to StructureMap
const fmlContent = `
map "http://example.org/PatientMapping" = "PatientMapping"
uses "http://hl7.org/fhir/StructureDefinition/QuestionnaireResponse" alias QR as source
uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as target

group QuestionnaireResponse(source src : QR, target tgt : Patient) {
  src.item as item -> tgt.gender = 'unknown';
}
`;

const structureMap = await runner.compileStructureMap(fmlContent);

// Execute transformation
const inputData = { resourceType: "QuestionnaireResponse", status: "completed" };
const result = await runner.executeStructureMap(structureMap.url, inputData);
```

#### REST API Server

```bash
# Start server with default settings
npm start

# Start with custom port and base URL
npm start -- --port 8080 --base-url ./my-maps

# Or using environment variables
PORT=8080 BASE_URL=./my-maps npm start
```

The REST API will be available at `http://localhost:8080` with endpoints:
- `POST /StructureMap/` - Upload StructureMap
- `GET /StructureMap/{id}` - Retrieve StructureMap  
- `POST /StructureMap/$transform` - Transform data
- `POST /Bundle` - Bulk resource upload
- Full CRUD for ConceptMap, ValueSet, CodeSystem, StructureDefinition

## Key Features

### FHIR Mapping Language Support
- **Complete FML parser** with proper tokenization and grammar handling
- **Preamble support** including ConceptMap declarations, Prefix statements
- **Enhanced comment handling** (single-line, multi-line, documentation)
- **Robust parsing** with graceful error recovery

### FHIR Terminology Ecosystem
- **ConceptMap operations**: CRUD + `$translate` with equivalence mapping
- **ValueSet operations**: CRUD + `$expand`, `$validate-code`
- **CodeSystem operations**: CRUD + `$lookup`, `$subsumes`, `$validate-code`
- **StructureDefinition management**: Logical models and profiles
- **Bundle processing**: Bulk resource operations

### Advanced Execution Engine
- **Official FHIRPath integration** using HL7 FHIRPath library v4.6.0
- **Terminology-aware transformations** with ConceptMap integration
- **Validation support** with strict/non-strict execution modes
- **Memory-efficient caching** for repeated executions

### Developer Experience
- **Library + REST API**: Use programmatically or via HTTP endpoints
- **TypeScript support**: Full type definitions included
- **Comprehensive testing**: 108 tests covering all functionality
- **OpenAPI documentation**: Complete API specification

## Development

### Project Structure

```
fmlrunner/
├── src/                    # Source code
│   ├── api/               # REST API server implementation
│   ├── lib/               # Core library components
│   ├── types/             # TypeScript type definitions
│   ├── index.ts           # Main library entry point
│   └── server.ts          # REST API server entry point
├── tests/                 # Test suites
├── docs/                  # Documentation
└── dist/                  # Compiled output (generated)
```

### Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Start development server
npm run dev

# Clean build artifacts
npm run clean
```

### Testing

The project includes comprehensive test coverage across:

- **FML Compilation Tests**: Parser validation and StructureMap generation
- **Execution Tests**: Transformation logic and FHIRPath integration
- **API Tests**: REST endpoint functionality and FHIR compliance
- **Terminology Tests**: ConceptMap, ValueSet, CodeSystem operations
- **Integration Tests**: End-to-end workflows and bundle processing

Run specific test suites:
```bash
# Run FML compilation tests
npm test -- --testNamePattern="FML.*compilation"

# Run execution tests
npm test -- --testNamePattern="execution|execute"

# Run API tests
npm test -- --testNamePattern="API|endpoint"
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [`REQUIREMENTS.md`](./docs/REQUIREMENTS.md) - Complete functional requirements
- [`api.yaml`](./docs/api.yaml) - OpenAPI 3.0 specification for all endpoints

## API Reference

### Library Methods

```javascript
// Core compilation and execution
await runner.compileStructureMap(fmlContent)
await runner.executeStructureMap(url, inputData)

// Resource management
await runner.registerConceptMap(conceptMap)
await runner.registerValueSet(valueSet)
await runner.registerCodeSystem(codeSystem)
await runner.registerStructureDefinition(structureDefinition)

// Bundle operations
await runner.processBundle(bundle)
await runner.getBundleStats()

// Terminology operations
await runner.translateCode(system, code, targetSystem)
await runner.validateCodeInValueSet(code, valueSetUrl)
await runner.expandValueSet(valueSetUrl)
await runner.lookupConcept(system, code)
```

### REST API Endpoints

#### Core StructureMap Operations
- `POST /StructureMap/` - Create StructureMap
- `GET /StructureMap/{id}` - Get StructureMap
- `PUT /StructureMap/{id}` - Update StructureMap  
- `DELETE /StructureMap/{id}` - Delete StructureMap
- `POST /StructureMap/$transform` - Transform data

#### Terminology Resources
- `/ConceptMap/` - Full CRUD + `$translate`
- `/ValueSet/` - Full CRUD + `$expand`, `$validate-code`
- `/CodeSystem/` - Full CRUD + `$lookup`, `$subsumes`, `$validate-code`
- `/StructureDefinition/` - Full CRUD for logical models

#### Bundle Operations
- `POST /Bundle` - Bulk resource upload
- `GET /Bundle/summary` - Resource statistics

## Configuration

### Command Line Options

```bash
# Server configuration
--port, -p <number>     # Server port (default: 3000)
--base-url, -b <path>   # StructureMap base directory
--help, -h              # Show help

# Example
node dist/server.js --port 8080 --base-url ./maps
```

### Environment Variables

```bash
PORT=3000              # Server listening port
BASE_URL=./test-data   # Base directory for StructureMap files
```

## Implementation Status

✅ **Complete implementation** with all requested features:
- Robust FML parser with complete preamble support
- FHIR-compliant REST API with singular resource naming
- Official FHIRPath library integration (v4.6.0)
- Comprehensive terminology ecosystem
- Bundle processing capabilities
- Library API exposure (80+ methods)
- Validation framework with strict/non-strict modes
- Command line configuration
- JSON-only format enforcement

**Test Results**: 108/108 tests passing across 10 test suites

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

Please refer to the requirements documents in the `docs/` directory for implementation guidelines and specifications. All contributions should maintain the existing test coverage and follow the established coding patterns.