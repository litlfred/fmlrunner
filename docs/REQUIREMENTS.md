# FML Runner Requirements

## Overview

The FML Runner is a Node.js library for compiling FHIR Mapping Language (FML) files and executing FHIR StructureMaps to transform healthcare data.

## Core Functional Requirements

### 1. FML Compilation (FR-001)
**Requirement:** The library SHALL be able to take FHIR Mapping Language (FML) content and compile it to produce a FHIR StructureMap resource as JSON.

**Acceptance Criteria:**
- Accept FML content as input string
- Parse and validate FML syntax
- Generate valid FHIR StructureMap JSON resource
- Handle compilation errors gracefully

### 2. StructureMap Execution (FR-002)
**Requirement:** The library SHALL be able to execute a StructureMap on given content multiple times efficiently.

**Acceptance Criteria:**
- Accept StructureMap reference and input content
- Execute transformation according to StructureMap rules
- Return transformed output
- Support multiple executions of the same StructureMap
- Cache compiled StructureMaps for performance

### 3. StructureMap Retrieval (FR-003)
**Requirement:** The library SHALL support retrieving StructureMaps from multiple sources.

**Acceptance Criteria:**
- Load StructureMaps from local directory relative to deployment
- Load StructureMaps from URL using canonical identifier
- Handle retrieval errors appropriately

### 4. API Framework (FR-004)
**Requirement:** The library SHALL provide a clean API framework that separates functionality appropriately.

**Acceptance Criteria:**
- Clear separation between compilation, execution, and retrieval
- Well-defined interfaces for each function
- Suitable for integration into larger application frameworks
- Not a microservice itself, but suitable for use within microservices

### 5. OpenAPI Specification (FR-005)
**Requirement:** All API functionality SHALL be described using OpenAPI specification.

**Acceptance Criteria:**
- Complete OpenAPI 3.0 specification
- Document all endpoints and operations
- Include request/response schemas
- Support for microservice architecture deployment

## Technical Requirements

### Library Architecture
- **Target Platform:** Node.js >=16.0.0
- **Package Type:** NPM package
- **Usage Pattern:** Library for integration into larger applications
- **API Style:** RESTful endpoints with OpenAPI specification

### Error Handling
- Graceful handling of compilation errors
- Clear error messages for debugging
- Proper HTTP status codes in API responses

### Performance Considerations
- Efficient caching of compiled StructureMaps
- Optimize for multiple executions of the same StructureMap
- Minimal memory footprint for library usage