# FML Syntax Validation Endpoint

This document describes the FML (FHIR Mapping Language) syntax validation endpoint implementation added to the FML Runner library.

## Overview

The FML syntax validation endpoint provides comprehensive syntax checking for FHIR Mapping Language content without performing full compilation. It returns detailed error messages with line and column information to help developers debug FML syntax issues.

## API Endpoints

### REST API

#### POST /api/v1/fml/validate-syntax

Validates FML syntax and returns detailed validation results.

**Request Body:**
```json
{
  "fmlContent": "map \"http://example.org/fhir/StructureMap/Test\" = \"Test\"\n\ngroup Test(source src, target tgt) {\n  src.name -> tgt.name;\n}"
}
```

**Response (Valid FML):**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "information",
      "code": "informational",
      "diagnostics": "FML syntax is valid"
    }
  ]
}
```

**Response (Invalid FML):**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "diagnostics": "FML content must start with a map declaration",
      "location": ["line 1, column 1"]
    }
  ]
}
```

### MCP Interface

#### validate-fml-syntax Tool

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

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"valid\": true, \"errors\": [], \"warnings\": []}"
    }
  ]
}
```

## Core Library Usage

```typescript
import { FmlRunner } from 'fmlrunner';

const runner = new FmlRunner();
const result = runner.validateFmlSyntax(fmlContent);

console.log('Valid:', result.valid);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

## Features

### Error Detection
- **Empty Content**: Detects when FML content is empty or whitespace-only
- **Missing Map Declaration**: Ensures FML starts with a map declaration
- **Bracket Validation**: Detects unmatched braces `{}` and parentheses `()`
- **Keyword Validation**: Validates presence of required FML keywords
- **Tokenization Errors**: Catches lexical analysis errors
- **Parse Errors**: Identifies structural parsing issues

### Warning System
- **Missing Groups**: Warns when no group definitions are found
- **Best Practices**: Additional warnings for FML best practices

### Comment Handling
- **Single-line Comments**: Properly handles `//` comments
- **Multi-line Comments**: Supports `/* */` comment blocks
- **Comment Skipping**: Comments are ignored during validation

### Detailed Error Information
Each error includes:
- **Line Number**: The line where the error occurred
- **Column Number**: The column position of the error
- **Error Message**: Human-readable description of the issue
- **Error Code**: Structured error code for programmatic handling

## Error Codes

| Code | Description |
|------|-------------|
| `EMPTY_CONTENT` | FML content is empty or contains only whitespace |
| `MISSING_MAP_DECLARATION` | FML does not start with a map declaration |
| `TOKENIZATION_ERROR` | Error during lexical analysis |
| `PARSE_ERROR` | Error during structural parsing |
| `UNMATCHED_BRACE` | Closing brace without matching opening brace |
| `UNMATCHED_PAREN` | Closing parenthesis without matching opening parenthesis |
| `UNCLOSED_BRACE` | Opening brace without matching closing brace |
| `UNCLOSED_PAREN` | Opening parenthesis without matching closing parenthesis |
| `MISSING_MAP` | Required map declaration is missing |

## Warning Codes

| Code | Description |
|------|-------------|
| `NO_GROUPS` | No group definitions found in the FML |

## Examples

### Valid FML
```fml
map "http://example.org/fhir/StructureMap/PatientTransform" = "PatientTransform"

uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
uses "http://example.org/StructureDefinition/MyPatient" alias MyPatient as target

group Patient(source src : Patient, target tgt : MyPatient) {
  src.name -> tgt.name;
  src.gender -> tgt.gender;
  src.birthDate -> tgt.birthDate;
}
```

### Invalid FML Examples

#### Missing Map Declaration
```fml
// Missing map declaration
uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source

group Test(source src : Patient, target tgt) {
  src.name -> tgt.name;
}
```
**Error**: `MISSING_MAP_DECLARATION` at line 1, column 1

#### Unmatched Braces
```fml
map "http://example.org/fhir/StructureMap/Test" = "Test"

group Test(source src, target tgt) {
  src.name -> tgt.name;
  // Missing closing brace
```
**Error**: `UNCLOSED_BRACE` 

#### Unmatched Parentheses
```fml
map "http://example.org/fhir/StructureMap/Test" = "Test"

group Test(source src, target tgt {
  src.name -> tgt.name;
}
```
**Error**: `UNCLOSED_PAREN`

## Implementation Details

### Core Types

```typescript
interface FmlSyntaxValidationResult {
  valid: boolean;
  errors: FmlSyntaxError[];
  warnings?: FmlSyntaxWarning[];
}

interface FmlSyntaxError {
  line: number;
  column: number;
  message: string;
  severity: 'error';
  code?: string;
}

interface FmlSyntaxWarning {
  line: number;
  column: number;
  message: string;
  severity: 'warning';
  code?: string;
}
```

### Packages Modified

1. **Core Library** (`packages/fmlrunner`):
   - Added syntax validation types
   - Implemented `validateSyntax()` in `FmlCompiler`
   - Added `validateFmlSyntax()` to `FmlRunner`

2. **REST API** (`packages/fmlrunner-rest`):
   - Added `/api/v1/fml/validate-syntax` endpoint
   - FHIR OperationOutcome responses

3. **MCP Interface** (`packages/fmlrunner-mcp`):
   - Added `validate-fml-syntax` tool
   - JSON schema validation

## Testing

The implementation includes comprehensive test coverage:

- **Core Library Tests**: 11/11 tests passing
- **REST API Tests**: 8/8 tests passing  
- **MCP Interface**: Manual testing confirms functionality

All tests verify error detection, warning generation, line/column reporting, and proper handling of edge cases.