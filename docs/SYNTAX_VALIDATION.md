# FML Syntax Validation Endpoint

This document describes the new syntax validation endpoint added to the FML Runner, which provides comprehensive syntax validation for FHIR Mapping Language (FML) content without requiring full compilation.

## Overview

The syntax validation endpoint validates FML syntax using the same tokenizer and parser as the compilation process, but focuses only on syntax correctness rather than semantic validation or StructureMap generation. This makes it faster and more suitable for real-time editing scenarios.

## Endpoints

### REST API

**Endpoint:** `POST /api/v1/validate-syntax`

**Request Body:**
```json
{
  "fmlContent": "map \"http://example.org/StructureMap/test\" = \"TestMap\"\n\ngroup main(source src, target tgt) {\n  src.name -> tgt.name;\n}"
}
```

**Response (Success):**
```json
{
  "resourceType": "OperationOutcome",
  "issue": []
}
```

**Response (Validation Errors):**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "diagnostics": "FML content cannot be empty",
      "location": ["line 1, column 1"]
    }
  ]
}
```

**Response (Warnings):**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "warning",
      "code": "informational",
      "diagnostics": "FML content should start with a \"map\" declaration",
      "location": ["line 1, column 1"]
    }
  ]
}
```

### MCP Tool

**Tool Name:** `validate-fml-syntax`

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "fmlContent": {
      "type": "string",
      "description": "FML content to validate"
    }
  },
  "required": ["fmlContent"]
}
```

**Example Usage:**
```json
{
  "name": "validate-fml-syntax",
  "arguments": {
    "fmlContent": "map \"http://example.org/StructureMap/test\" = \"TestMap\"\n\ngroup main(source src, target tgt) {\n  src.name -> tgt.name;\n}"
  }
}
```

**Example Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"success\": true,\n  \"errors\": undefined,\n  \"warnings\": undefined\n}"
    }
  ]
}
```

## Core Library

### Method

```typescript
class FmlRunner {
  validateFmlSyntax(fmlContent: string): FmlSyntaxValidationResult
}
```

### Types

```typescript
interface FmlSyntaxValidationResult {
  success: boolean;
  errors?: SyntaxError[];
  warnings?: SyntaxWarning[];
}

interface SyntaxError {
  message: string;
  line: number;
  column: number;
  severity: 'error';
}

interface SyntaxWarning {
  message: string;
  line: number;
  column: number;
  severity: 'warning';
}
```

### Example Usage

```typescript
import { FmlRunner } from 'fmlrunner';

const runner = new FmlRunner();

const result = runner.validateFmlSyntax(`
  map "http://example.org/StructureMap/test" = "TestMap"

  group main(source src, target tgt) {
    src.name -> tgt.name;
  }
`);

if (result.success) {
  console.log('FML syntax is valid');
  if (result.warnings) {
    result.warnings.forEach(warning => {
      console.warn(`Warning at line ${warning.line}: ${warning.message}`);
    });
  }
} else {
  console.error('FML syntax errors found:');
  result.errors?.forEach(error => {
    console.error(`Error at line ${error.line}, column ${error.column}: ${error.message}`);
  });
}
```

## Validation Features

### Error Detection
- **Empty Content**: Detects when FML content is empty or contains only whitespace
- **Tokenization Errors**: Catches invalid characters and malformed tokens with precise location
- **Parse Errors**: Identifies structural syntax issues in FML grammar
- **Location Information**: Provides line and column numbers for all errors

### Warning Detection
- **Missing Map Declaration**: Warns when FML content doesn't start with a `map` declaration
- **Best Practices**: Additional warnings for FML best practices (future enhancement)

### Graceful Handling
- **Robust Error Handling**: Never crashes on malformed input
- **Fallback Parsing**: Attempts to extract useful information even from partially invalid FML
- **Detailed Messages**: Provides clear, actionable error messages

## Comparison with Compilation

| Feature | Syntax Validation | Full Compilation |
|---------|------------------|------------------|
| Speed | Fast | Slower |
| Validation Level | Syntax only | Syntax + Semantics |
| Output | Errors/Warnings | StructureMap + Errors |
| Use Case | Real-time editing | Production deployment |
| Schema Validation | No | Yes (input/output) |
| Structure Creation | No | Yes |

## Error Codes

### HTTP Status Codes
- `200`: Validation successful (may include warnings)
- `400`: Validation failed with errors or missing required fields
- `500`: Internal server error

### FHIR OperationOutcome Codes
- `invalid`: Syntax errors in FML content
- `informational`: Warnings and best practice suggestions

## Examples

### Valid FML
```
Input:
map "http://example.org/StructureMap/patient" = "PatientMap"

group main(source src : Patient, target tgt : Patient) {
  src.name -> tgt.name;
  src.birthDate -> tgt.birthDate;
}

Response: HTTP 200 with empty issues array
```

### Syntax Error
```
Input:
map "http://example.org/StructureMap/patient" = "PatientMap"

group main(source src : Patient, target tgt : Patient {
  src.name -> tgt.name;
}

Response: HTTP 400 with error about missing closing parenthesis
```

### Warning
```
Input:
group main(source src : Patient, target tgt : Patient) {
  src.name -> tgt.name;
}

Response: HTTP 200 with warning about missing map declaration
```

## Integration

This endpoint integrates seamlessly with:
- **IDEs and editors** for real-time syntax highlighting
- **CI/CD pipelines** for pre-compilation validation
- **Development tools** for FML authoring assistance
- **API workflows** where syntax validation is needed before processing

The syntax validation provides a lightweight alternative to full compilation when only syntax correctness needs to be verified.