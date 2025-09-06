# API Requirements

## 1. Overview

This document defines the API requirements for the FML Runner library, including the programming interfaces for library consumers and OpenAPI specifications for microservice deployment scenarios.

## 2. Library API Requirements

### 2.1 Core API Interface (API-001)

**Requirement:** The library SHALL expose a clean, well-documented API for all core functionality.

#### 2.1.1 FMLCompiler Interface

```typescript
interface FMLCompiler {
  /**
   * Compile FML content to StructureMap
   */
  compile(fmlContent: string, options?: CompilationOptions): Promise<StructureMap>;
  
  /**
   * Compile FML from file
   */
  compileFromFile(filePath: string, options?: CompilationOptions): Promise<StructureMap>;
  
  /**
   * Validate FML content without compilation
   */
  validate(fmlContent: string): ValidationResult;
}

interface CompilationOptions {
  fhirVersion?: 'R4' | 'R5';
  strictMode?: boolean;
  includeDebugInfo?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

#### 2.1.2 StructureMapExecutor Interface

```typescript
interface StructureMapExecutor {
  /**
   * Execute StructureMap on input data
   */
  execute(structureMap: StructureMap, sourceData: any, context?: ExecutionContext): Promise<any>;
  
  /**
   * Execute with custom transformation context
   */
  executeWithContext(
    structureMap: StructureMap, 
    sourceData: any, 
    context: ExecutionContext
  ): Promise<ExecutionResult>;
  
  /**
   * Validate StructureMap before execution
   */
  validateStructureMap(structureMap: StructureMap): ValidationResult;
}

interface ExecutionContext {
  variables?: Record<string, any>;
  functions?: Record<string, Function>;
  resolver?: ResourceResolver;
}

interface ExecutionResult {
  result: any;
  logs: ExecutionLog[];
  performance: PerformanceMetrics;
}
```

#### 2.1.3 StructureMapRetriever Interface

```typescript
interface StructureMapRetriever {
  /**
   * Retrieve StructureMap from local directory
   */
  getFromDirectory(path: string, id: string): Promise<StructureMap>;
  
  /**
   * Retrieve StructureMap from URL
   */
  getFromUrl(canonicalUrl: string, options?: RetrievalOptions): Promise<StructureMap>;
  
  /**
   * Check if StructureMap exists
   */
  exists(identifier: string, source: 'directory' | 'url'): Promise<boolean>;
  
  /**
   * List available StructureMaps
   */
  list(source: 'directory' | 'url', path?: string): Promise<StructureMapInfo[]>;
}

interface RetrievalOptions {
  timeout?: number;
  headers?: Record<string, string>;
  authentication?: AuthConfig;
  cache?: boolean;
}
```

### 2.2 Main Library Interface (API-002)

**Requirement:** The library SHALL provide a unified main interface that orchestrates all functionality.

```typescript
interface FMLRunner {
  // Core functionality
  readonly compiler: FMLCompiler;
  readonly executor: StructureMapExecutor;
  readonly retriever: StructureMapRetriever;
  
  /**
   * Compile and execute in one operation
   */
  compileAndExecute(
    fmlContent: string, 
    sourceData: any, 
    options?: CompileAndExecuteOptions
  ): Promise<any>;
  
  /**
   * Execute using StructureMap reference
   */
  executeByReference(
    structureMapRef: StructureMapReference, 
    sourceData: any, 
    context?: ExecutionContext
  ): Promise<any>;
  
  /**
   * Configuration management
   */
  configure(config: FMLRunnerConfig): void;
  getConfiguration(): FMLRunnerConfig;
  
  /**
   * Cache management
   */
  clearCache(): void;
  getCacheStats(): CacheStatistics;
  
  /**
   * Event handling
   */
  on(event: string, listener: Function): void;
  off(event: string, listener: Function): void;
  emit(event: string, ...args: any[]): void;
}
```

### 2.3 Factory and Builder Patterns (API-003)

**Requirement:** The library SHALL support multiple instantiation patterns for different use cases.

```typescript
// Factory pattern
class FMLRunnerFactory {
  static create(config?: FMLRunnerConfig): FMLRunner;
  static createWithDefaults(): FMLRunner;
  static createForMicroservice(microserviceConfig: MicroserviceConfig): FMLRunner;
}

// Builder pattern
class FMLRunnerBuilder {
  withCompiler(compiler: FMLCompiler): FMLRunnerBuilder;
  withExecutor(executor: StructureMapExecutor): FMLRunnerBuilder;
  withRetriever(retriever: StructureMapRetriever): FMLRunnerBuilder;
  withCache(cacheConfig: CacheConfig): FMLRunnerBuilder;
  withEventEmitter(emitter: EventEmitter): FMLRunnerBuilder;
  build(): FMLRunner;
}
```

## 3. OpenAPI Specification Requirements

### 3.1 REST API Endpoints (API-004)

**Requirement:** The library SHALL provide OpenAPI specifications for REST API endpoints suitable for microservice deployment.

#### 3.1.1 Compilation Endpoints

```yaml
paths:
  /api/v1/compile:
    post:
      summary: Compile FML to StructureMap
      operationId: compileFML
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CompilationRequest'
          text/plain:
            schema:
              type: string
              description: Raw FML content
      responses:
        '200':
          description: Compilation successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StructureMap'
        '400':
          description: Compilation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /api/v1/validate:
    post:
      summary: Validate FML content
      operationId: validateFML
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ValidationRequest'
      responses:
        '200':
          description: Validation result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationResult'
```

#### 3.1.2 Execution Endpoints

```yaml
  /api/v1/execute:
    post:
      summary: Execute StructureMap transformation
      operationId: executeStructureMap
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ExecutionRequest'
      responses:
        '200':
          description: Execution successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ExecutionResponse'
        '400':
          description: Execution error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /api/v1/execute/{structureMapId}:
    post:
      summary: Execute StructureMap by ID
      operationId: executeStructureMapById
      parameters:
        - name: structureMapId
          in: path
          required: true
          schema:
            type: string
          description: StructureMap identifier
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ExecutionByIdRequest'
      responses:
        '200':
          description: Execution successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ExecutionResponse'
```

#### 3.1.3 StructureMap Management Endpoints

```yaml
  /api/v1/structure-maps:
    get:
      summary: List available StructureMaps
      operationId: listStructureMaps
      parameters:
        - name: source
          in: query
          schema:
            type: string
            enum: [directory, url]
          description: Source type for listing
        - name: path
          in: query
          schema:
            type: string
          description: Path or URL for listing
      responses:
        '200':
          description: List of StructureMaps
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/StructureMapInfo'

  /api/v1/structure-maps/{id}:
    get:
      summary: Retrieve StructureMap by ID
      operationId: getStructureMapById
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: StructureMap retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StructureMap'
        '404':
          description: StructureMap not found
```

### 3.2 Schema Definitions (API-005)

**Requirement:** The OpenAPI specification SHALL include comprehensive schema definitions for all data structures.

```yaml
components:
  schemas:
    CompilationRequest:
      type: object
      required:
        - content
      properties:
        content:
          type: string
          description: FML content to compile
        options:
          $ref: '#/components/schemas/CompilationOptions'

    CompilationOptions:
      type: object
      properties:
        fhirVersion:
          type: string
          enum: [R4, R5]
          default: R4
        strictMode:
          type: boolean
          default: false
        includeDebugInfo:
          type: boolean
          default: false

    ExecutionRequest:
      type: object
      required:
        - structureMap
        - sourceData
      properties:
        structureMap:
          $ref: '#/components/schemas/StructureMap'
        sourceData:
          type: object
          description: Source data to transform
        context:
          $ref: '#/components/schemas/ExecutionContext'

    ExecutionByIdRequest:
      type: object
      required:
        - sourceData
      properties:
        sourceData:
          type: object
          description: Source data to transform
        context:
          $ref: '#/components/schemas/ExecutionContext'
        retrievalOptions:
          $ref: '#/components/schemas/RetrievalOptions'

    ExecutionResponse:
      type: object
      properties:
        result:
          type: object
          description: Transformed data
        logs:
          type: array
          items:
            $ref: '#/components/schemas/ExecutionLog'
        performance:
          $ref: '#/components/schemas/PerformanceMetrics'

    ErrorResponse:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
          description: Error type
        message:
          type: string
          description: Error message
        details:
          type: object
          description: Additional error details
        timestamp:
          type: string
          format: date-time
```

### 3.3 Authentication and Security (API-006)

**Requirement:** The OpenAPI specification SHALL define security schemes for API access.

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
    
    OAuth2:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: /oauth/token
          scopes:
            fml:compile: Compile FML content
            fml:execute: Execute StructureMaps
            fml:read: Read StructureMaps

security:
  - BearerAuth: []
  - ApiKeyAuth: []
  - OAuth2: [fml:compile, fml:execute, fml:read]
```

## 4. Error Handling API (API-007)

**Requirement:** The API SHALL provide consistent error handling and reporting mechanisms.

### 4.1 Error Types

```typescript
enum ErrorType {
  COMPILATION_ERROR = 'COMPILATION_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RETRIEVAL_ERROR = 'RETRIEVAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR'
}

interface FMLRunnerError extends Error {
  readonly type: ErrorType;
  readonly code: string;
  readonly details?: any;
  readonly sourceLocation?: SourceLocation;
  readonly timestamp: Date;
}
```

### 4.2 HTTP Status Code Mapping

- `200 OK` - Successful operation
- `400 Bad Request` - Invalid input data or parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - StructureMap or resource not found
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limiting
- `500 Internal Server Error` - Internal processing error
- `502 Bad Gateway` - External service error
- `503 Service Unavailable` - Service temporarily unavailable

## 5. Versioning and Compatibility (API-008)

**Requirement:** The API SHALL support versioning and backward compatibility.

### 5.1 API Versioning Strategy

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Include version in URL path: `/api/v1/`, `/api/v2/`
- Support multiple API versions simultaneously
- Provide deprecation notices for older versions
- Maintain backward compatibility within major versions

### 5.2 Content Type Versioning

```yaml
paths:
  /api/v1/compile:
    post:
      requestBody:
        content:
          application/vnd.fmlrunner.v1+json:
            schema:
              $ref: '#/components/schemas/CompilationRequestV1'
          application/vnd.fmlrunner.v2+json:
            schema:
              $ref: '#/components/schemas/CompilationRequestV2'
```

## 6. Performance and Monitoring API (API-009)

**Requirement:** The API SHALL provide endpoints for performance monitoring and diagnostics.

```yaml
paths:
  /api/v1/health:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: Service is healthy

  /api/v1/metrics:
    get:
      summary: Performance metrics
      responses:
        '200':
          description: Performance metrics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MetricsResponse'

  /api/v1/cache/stats:
    get:
      summary: Cache statistics
      responses:
        '200':
          description: Cache statistics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CacheStatistics'
```