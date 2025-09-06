# Functional Requirements

## 1. Overview

The FML Runner library shall provide functionality for compiling FHIR Mapping Language (FML) content and executing FHIR StructureMaps to transform healthcare data.

## 2. Core Functional Requirements

### 2.1 FML Compilation (FR-001)

**Requirement:** The library SHALL compile FHIR Mapping Language (FML) content into FHIR StructureMap resources.

**Acceptance Criteria:**
- Accept FML content as input (string, file path, or stream)
- Parse and validate FML syntax according to FHIR specifications
- Generate valid FHIR StructureMap resources in JSON format
- Handle compilation errors with detailed error messages and line numbers
- Support all FML language constructs as defined in FHIR R4/R5 specifications

**Input:** FML content (text/string format)
**Output:** FHIR StructureMap resource (JSON format)

### 2.2 StructureMap Execution (FR-002)

**Requirement:** The library SHALL execute StructureMaps on input content to perform data transformations.

**Acceptance Criteria:**
- Accept StructureMap resource and input content
- Execute transformation rules defined in the StructureMap
- Support all StructureMap transformation types (create, copy, evaluate, etc.)
- Handle nested transformations and rule dependencies
- Provide detailed execution logs and error reporting
- Support FHIR Path expressions within transformations

**Input:** 
- StructureMap resource (JSON format)
- Source content (JSON/XML format)
- Optional transformation context

**Output:** Transformed FHIR resource(s) (JSON format)

### 2.3 StructureMap Retrieval (FR-003)

**Requirement:** The library SHALL support multiple mechanisms for retrieving StructureMaps.

#### 2.3.1 Local Directory Retrieval (FR-003a)

**Acceptance Criteria:**
- Load StructureMaps from local file system directories
- Support relative paths from deployment directory
- Handle file system errors gracefully
- Support multiple file formats (JSON, XML)
- Implement file watching for dynamic updates (optional)

#### 2.3.2 URL-based Retrieval (FR-003b)

**Acceptance Criteria:**
- Retrieve StructureMaps using canonical URLs
- Support HTTP/HTTPS protocols
- Implement caching mechanisms for remote resources
- Handle network errors and timeouts
- Validate retrieved content before use

### 2.4 Error Handling (FR-004)

**Requirement:** The library SHALL provide comprehensive error handling and reporting.

**Acceptance Criteria:**
- Define specific error types for different failure scenarios
- Provide detailed error messages with context
- Include source location information for compilation errors
- Support error categorization (syntax, semantic, runtime)
- Implement proper error propagation to calling applications
- Log errors appropriately without exposing sensitive data

### 2.5 Logical Model Support (FR-005)

**Requirement:** The library SHALL support FHIR StructureDefinitions for logical models and data validation.

**Acceptance Criteria:**
- Store and manage FHIR StructureDefinition resources alongside StructureMaps
- Support logical models, profiles, and extensions
- Provide CRUD operations for StructureDefinitions following FHIR RESTful patterns
- Support validation of data against StructureDefinitions
- Handle both differential and snapshot views of StructureDefinitions

**Input:** FHIR StructureDefinition resources (JSON format)
**Output:** Stored StructureDefinitions available for validation and reference

### 2.6 Validation Framework (FR-006)

**Requirement:** The library SHALL provide comprehensive validation capabilities for FHIR resources and data against StructureDefinitions.

**Acceptance Criteria:**
- Validate FHIR resources against standard FHIR profiles
- Validate data against custom logical models
- Support element cardinality validation (min/max)
- Support datatype validation
- Support constraint validation (FHIRPath expressions)
- Support fixed value and pattern validation
- Support terminology binding validation
- Provide detailed validation results with error locations and descriptions

**Input:** 
- FHIR resource or data (JSON format)
- StructureDefinition URL or resource
- Validation options

**Output:** Validation result with errors, warnings, and success status

### 2.7 Execution Modes (FR-007)

**Requirement:** The library SHALL support strict and non-strict execution modes for StructureMap transformations with validation.

#### 2.7.1 Strict Mode Execution (FR-007a)

**Acceptance Criteria:**
- Validate input data against source StructureDefinition before transformation
- Fail execution immediately if input validation fails
- Validate output data against target StructureDefinition after transformation
- Fail execution if output validation fails
- Provide detailed error reporting for all validation failures
- Stop processing on first validation error

#### 2.7.2 Non-Strict Mode Execution (FR-007b)

**Acceptance Criteria:**
- Validate input data but continue execution even if validation fails
- Log validation warnings for input validation failures
- Attempt transformation even with invalid input
- Validate output data and log warnings for validation failures
- Return transformation result with validation status
- Collect and report all validation issues without stopping execution

**Input:** 
- StructureMap resource
- Source data
- Execution options (mode, validation settings)
- Optional StructureDefinition URLs for input/output validation

**Output:** Enhanced execution result with validation information

### 2.8 StructureDefinition Management (FR-008)

**Requirement:** The library SHALL provide FHIR-compliant CRUD operations for StructureDefinition management.

**Acceptance Criteria:**
- Create new StructureDefinitions with server-assigned IDs (POST)
- Update existing StructureDefinitions or create with specific ID (PUT)
- Retrieve StructureDefinitions by ID (GET)
- Delete StructureDefinitions (DELETE)
- List StructureDefinitions with FHIR search parameters
- Support filtering by kind (logical, resource, complex-type, primitive-type)
- Support filtering by status, name, url, version
- Support pagination with _count and _offset parameters

**Input:** StructureDefinition resources, search parameters
**Output:** StructureDefinition resources, search results

## 3. Data Format Requirements

### 3.1 Input Formats (FR-009)

**Supported Input Formats:**
- FML content: Plain text (UTF-8 encoding)
- StructureMap: JSON format (FHIR-compliant)
- StructureDefinition: JSON format (FHIR-compliant)
- Source data: JSON or XML format
- Configuration: JSON format

### 3.2 Output Formats (FR-010)

**Supported Output Formats:**
- StructureMap resources: JSON format (FHIR R4/R5 compliant)
- StructureDefinition resources: JSON format (FHIR R4/R5 compliant)
- Transformed resources: JSON format (FHIR-compliant)
- Validation results: Structured JSON format
- Error responses: Structured JSON format
- Execution logs: JSON format

## 4. Validation Requirements

### 4.1 FML Validation (FR-012)

**Requirement:** The library SHALL validate FML content according to FHIR specifications.

**Acceptance Criteria:**
- Validate FML syntax and grammar
- Check semantic correctness of mapping rules
- Validate resource references and paths
- Ensure FHIR Path expression validity
- Report validation errors with specific locations

### 4.2 StructureMap Validation (FR-013)

**Requirement:** The library SHALL validate StructureMap resources before execution.

**Acceptance Criteria:**
- Validate StructureMap JSON structure against FHIR schema
- Check rule dependencies and circular references
- Validate source and target structure definitions
- Ensure all required elements are present
- Validate transformation logic consistency

### 4.3 StructureDefinition Validation (FR-014)

**Requirement:** The library SHALL validate StructureDefinition resources for correctness and consistency.

**Acceptance Criteria:**
- Validate StructureDefinition JSON structure against FHIR schema
- Check element path consistency and hierarchy
- Validate cardinality constraints (min <= max)
- Ensure type references are valid
- Validate constraint expressions (FHIRPath)
- Check binding strength and value set references

## 5. Configuration Requirements

### 5.1 Runtime Configuration (FR-015)

**Requirement:** The library SHALL support runtime configuration for various operational parameters.

**Configurable Parameters:**
- Cache size limits and eviction policies
- Network timeout values for remote retrieval
- Default directories for local StructureMap and StructureDefinition lookup
- Logging levels and output destinations
- FHIR version compatibility settings
- Validation mode defaults (strict/non-strict)

## 6. Integration Requirements

### 6.1 Library Interface (FR-010)

**Requirement:** The library SHALL provide clean interfaces for integration into larger application frameworks.

**Acceptance Criteria:**
- Expose well-defined public APIs
- Support both synchronous and asynchronous operations
- Provide TypeScript definitions for type safety
- Implement proper dependency injection patterns
- Support multiple instantiation patterns (singleton, factory, etc.)
- Minimize external dependencies

### 6.2 Event Handling (FR-017)

**Requirement:** The library SHALL provide event-driven interfaces for monitoring and extensibility.

**Acceptance Criteria:**
- Emit events for compilation start/complete/error
- Emit events for execution start/complete/error
- Emit events for validation start/complete/error
- Provide cache-related events (hit, miss, eviction)
- Support custom event listeners
- Include relevant metadata in event payloads

## 7. Security Requirements

### 7.1 Input Validation (FR-018)

**Requirement:** The library SHALL validate all inputs to prevent security vulnerabilities.

**Acceptance Criteria:**
- Sanitize all string inputs
- Validate file paths to prevent directory traversal
- Limit input size to prevent DoS attacks
- Validate URL formats for remote retrieval
- Implement proper encoding/decoding for all data formats
- Validate StructureDefinition content to prevent malicious payloads

### 7.2 Resource Access Control (FR-019)

**Requirement:** The library SHALL implement appropriate security controls for resource retrieval.

**Acceptance Criteria:**
- Implement proper SSL/TLS certificate validation
- Provide mechanisms to restrict accessible URLs/directories
- Log security-relevant events appropriately
- Handle network failures gracefully