# FML Runner Node.js Library

A comprehensive Node.js library for compiling and executing FHIR Mapping Language (FML) files to transform healthcare data using FHIR StructureMaps, with advanced validation capabilities and FHIR-compliant REST API.

## Features

### Core Functionality
- **FML Compilation**: Transform FHIR Mapping Language content into valid FHIR StructureMap JSON resources
- **StructureMap Execution**: Execute StructureMaps on input data with comprehensive error handling
- **Multi-source Retrieval**: Load StructureMaps from local files or remote URLs with LRU-based caching
- **FHIR Validation**: Validate input/output against StructureDefinitions with strict and non-strict modes

### FHIR-Compliant REST API
- **Complete CRUD Operations**: Full support for StructureMap and StructureDefinition resources
- **$transform Operation**: Standard FHIR operation for content transformation
- **Search Capabilities**: FHIR search parameters for resource discovery
- **Validation Endpoints**: Direct validation of FHIR resources against profiles

### Advanced Features
- **Logical Model Support**: Work with custom logical models and profiles
- **TypeScript Support**: Full type safety with comprehensive type definitions
- **Caching System**: Performance optimization with LRU-based caching
- **Production Ready**: Standalone server with health monitoring

## Quick Start

### Installation

```bash
npm install fml-runner
```

### Basic Usage

```typescript
import { FmlRunner } from 'fml-runner';

// Initialize with options
const fmlRunner = new FmlRunner({
  baseUrl: './maps',
  cacheEnabled: true,
  strictMode: false
});

// Compile FML to StructureMap
const fmlContent = `
  map "http://example.org/StructureMap/Patient" = "PatientTransform"
  
  group main(source src, target tgt) {
    src.name -> tgt.fullName;
    src.active -> tgt.isActive;
  }
`;

const compilationResult = fmlRunner.compileFml(fmlContent);
if (compilationResult.success) {
  console.log('Compiled StructureMap:', compilationResult.structureMap);
}

// Execute StructureMap
const inputData = {
  name: 'John Doe',
  active: true
};

const executionResult = await fmlRunner.executeStructureMap(
  'patient-transform.json',
  inputData
);

if (executionResult.success) {
  console.log('Transformed data:', executionResult.result);
}
```

### Validation with Logical Models

```typescript
import { FmlRunner, ValidationService } from 'fml-runner';

const fmlRunner = new FmlRunner({ strictMode: true });

// Register a StructureDefinition for validation
const patientProfile = {
  resourceType: 'StructureDefinition',
  url: 'http://example.org/StructureDefinition/Patient',
  name: 'PatientProfile',
  kind: 'resource',
  type: 'Patient',
  status: 'active',
  snapshot: {
    element: [
      {
        path: 'Patient',
        min: 1,
        max: '1'
      },
      {
        path: 'Patient.name',
        min: 1,
        max: '*',
        type: [{ code: 'string' }]
      }
    ]
  }
};

fmlRunner.registerStructureDefinition(patientProfile);

// Execute with validation
const result = await fmlRunner.executeStructureMapWithValidation(
  'patient-transform.json',
  inputData,
  {
    strictMode: true,
    validateInput: true,
    validateOutput: true,
    inputProfile: 'http://example.org/StructureDefinition/Patient',
    outputProfile: 'http://example.org/StructureDefinition/Patient'
  }
);

console.log('Execution result:', result.result);
console.log('Validation details:', result.validation);
```

## REST API

### Starting the Server

```bash
# Using npm scripts
npm start

# Or with custom configuration
PORT=3000 BASE_URL=./maps npm start
```

### Core Endpoints

#### FML Compilation
```http
POST /api/v1/compile
Content-Type: application/json

{
  "fmlContent": "map \"http://example.org/test\" = \"TestMap\" ..."
}
```

#### StructureMap Execution
```http
POST /api/v1/execute
Content-Type: application/json

{
  "structureMapReference": "transform.json",
  "inputContent": { "name": "John Doe" }
}
```

#### FHIR $transform Operation
```http
POST /api/v1/StructureMaps/$transform
Content-Type: application/json

{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "source",
      "resource": { "name": "John Doe" }
    },
    {
      "name": "map",
      "valueString": "patient-transform.json"
    }
  ]
}
```

### FHIR-Compliant CRUD Operations

#### StructureMaps
- `GET /api/v1/StructureMaps` - Search StructureMaps
- `GET /api/v1/StructureMaps/{id}` - Get StructureMap by ID
- `POST /api/v1/StructureMaps` - Create new StructureMap
- `PUT /api/v1/StructureMaps/{id}` - Update StructureMap
- `DELETE /api/v1/StructureMaps/{id}` - Delete StructureMap

#### StructureDefinitions
- `GET /api/v1/StructureDefinitions` - Search StructureDefinitions
- `POST /api/v1/StructureDefinitions` - Register logical model/profile
- `PUT /api/v1/StructureDefinitions/{id}` - Update StructureDefinition
- `DELETE /api/v1/StructureDefinitions/{id}` - Delete StructureDefinition

#### Validation
- `POST /api/v1/validate` - Validate resource against profile
- `POST /api/v1/execute-with-validation` - Execute with validation

### Search Parameters

StructureMaps support standard FHIR search parameters:
- `name` - Search by StructureMap name
- `status` - Filter by status (draft, active, retired)
- `url` - Search by canonical URL
- `_count` - Limit number of results
- `_offset` - Pagination offset

Example:
```http
GET /api/v1/StructureMaps?name=patient&status=active&_count=10
```

## API Reference

### Classes

#### FmlRunner

Main library class providing unified interface for all functionality.

```typescript
class FmlRunner {
  constructor(options?: FmlRunnerOptions);
  
  // Core methods
  compileFml(fmlContent: string): FmlCompilationResult;
  executeStructureMap(reference: string, input: any): Promise<ExecutionResult>;
  executeStructureMapWithValidation(reference: string, input: any, options?: ExecutionOptions): Promise<EnhancedExecutionResult>;
  getStructureMap(reference: string): Promise<StructureMap | null>;
  
  // Validation methods
  registerStructureDefinition(structureDefinition: StructureDefinition): void;
  getValidationService(): ValidationService | null;
  
  // Cache management
  clearCache(): void;
  setBaseDirectory(directory: string): void;
}
```

#### ValidationService

Validation engine for FHIR resources against StructureDefinitions.

```typescript
class ValidationService {
  registerStructureDefinition(structureDefinition: StructureDefinition): void;
  validate(resource: any, profileUrl: string): ValidationResult;
  clearStructureDefinitions(): void;
  getStructureDefinitions(): StructureDefinition[];
}
```

#### FmlRunnerApi

Express.js server implementing the REST API.

```typescript
class FmlRunnerApi {
  constructor(fmlRunner?: FmlRunner);
  getApp(): express.Application;
  listen(port?: number): void;
}
```

### Types

#### Configuration

```typescript
interface FmlRunnerOptions {
  baseUrl?: string;           // Base directory for StructureMap files
  cacheEnabled?: boolean;     // Enable LRU caching
  timeout?: number;          // Request timeout in milliseconds
  strictMode?: boolean;      // Enable strict validation mode
}

interface ExecutionOptions {
  strictMode?: boolean;      // Override global strict mode
  validateInput?: boolean;   // Validate input data
  validateOutput?: boolean;  // Validate output data
  inputProfile?: string;     // Input StructureDefinition URL
  outputProfile?: string;    // Output StructureDefinition URL
}
```

#### Results

```typescript
interface FmlCompilationResult {
  success: boolean;
  structureMap?: StructureMap;
  errors?: string[];
}

interface ExecutionResult {
  success: boolean;
  result?: any;
  errors?: string[];
}

interface EnhancedExecutionResult extends ExecutionResult {
  validation?: {
    input?: ValidationResult;
    output?: ValidationResult;
  };
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `BASE_URL` - Base directory for StructureMap files (default: ./maps)

### FmlRunner Options

```typescript
const fmlRunner = new FmlRunner({
  baseUrl: './structure-maps',    // Directory containing StructureMap files
  cacheEnabled: true,             // Enable caching for performance
  timeout: 10000,                 // Request timeout in milliseconds
  strictMode: false               // Global strict validation mode
});
```

## Validation Modes

### Strict Mode
In strict mode, validation errors cause execution to fail:

```typescript
const result = await fmlRunner.executeStructureMapWithValidation(
  'transform.json',
  inputData,
  { strictMode: true, validateInput: true }
);

// Execution fails if input validation has errors
if (!result.success) {
  console.log('Validation failed:', result.errors);
}
```

### Non-Strict Mode
In non-strict mode, validation warnings are reported but execution continues:

```typescript
const result = await fmlRunner.executeStructureMapWithValidation(
  'transform.json',
  inputData,
  { strictMode: false, validateInput: true }
);

// Execution continues even with validation warnings
console.log('Result:', result.result);
console.log('Warnings:', result.validation?.input?.warnings);
```

## Error Handling

The library uses FHIR-compliant error handling patterns:

### OperationOutcome Format
```typescript
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "StructureMap execution failed: Invalid input data"
    }
  ]
}
```

### Common Error Codes
- `not-found` - Resource not found
- `invalid` - Invalid request or resource
- `processing` - Execution or transformation error
- `exception` - Internal server error
- `invariant` - Validation constraint violation

## Performance Considerations

### Caching
- **LRU Cache**: Automatic caching of loaded StructureMaps
- **Memory Management**: Configurable cache size based on available memory
- **Cache Invalidation**: Manual cache clearing when needed

### Optimization Tips
- Enable caching for production environments
- Use local file storage for frequently accessed StructureMaps
- Register StructureDefinitions once during application startup
- Consider request timeouts for external StructureMap URLs

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test tests/validation-service.test.ts

# Run with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **Validation Tests**: StructureDefinition and validation logic
- **E2E Tests**: Complete workflow testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Setup
```bash
git clone https://github.com/litlfred/fmlrunner.git
cd fmlrunner
npm install
npm run build
npm test
```

## License

MIT License - see LICENSE file for details.

## Changelog

### v0.1.0
- Initial release with core FML compilation and execution
- FHIR-compliant REST API implementation
- Advanced validation framework
- StructureDefinition support for logical models
- Comprehensive test coverage (61 tests)
- Production-ready server with health monitoring