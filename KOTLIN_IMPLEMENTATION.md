# Kotlin/JS Core Implementation for FML Runner

## Overview

This implementation demonstrates how to share core FML (FHIR Mapping Language) business logic between Kotlin/JVM/Android and Node.js/JavaScript platforms using Kotlin Multiplatform.

## Architecture

### Core Components

1. **FML Compiler** (`src/commonMain/kotlin/org/litlfred/fmlrunner/compiler/`)
   - Tokenizes FML syntax
   - Parses FML content into StructureMap JSON
   - Cross-platform implementation with shared parsing logic

2. **StructureMap Executor** (`src/commonMain/kotlin/org/litlfred/fmlrunner/executor/`)
   - Executes StructureMaps on input data
   - Uses platform-specific FHIRPath engines
   - Provides validation and transformation capabilities

3. **FHIRPath Engine** (`src/commonMain/kotlin/org/litlfred/fmlrunner/fhirpath/`)
   - Cross-platform interface for FHIRPath evaluation
   - Basic implementation for JS
   - HAPI FHIR integration for JVM/Android (when available)

4. **Core Types** (`src/commonMain/kotlin/org/litlfred/fmlrunner/types/`)
   - Shared FHIR resource definitions
   - Serializable data structures
   - Common interfaces and enums

### Platform-Specific Implementations

#### JVM/Android
- Uses HAPI FHIR libraries for full FHIRPath support
- Access to complete FHIR validation capabilities
- Can leverage Java ecosystem libraries

#### JavaScript/Node.js
- Compiles to JavaScript modules
- Uses basic FHIRPath implementation
- Integrates with existing TypeScript codebase

## Usage

### From TypeScript/JavaScript

```typescript
import { FmlRunner } from '@litlfred/fmlrunner-core';

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

### From Kotlin/JVM

```kotlin
import org.litlfred.fmlrunner.FmlRunner

val runner = FmlRunner()

// Compile FML
val result = runner.compileFml("""
  map "http://example.org/StructureMap/Patient" = "PatientTransform"
  
  group main(source src, target tgt) {
    src.name -> tgt.fullName;
    src.active -> tgt.isActive;
  }
""")

// Execute transformation
val execResult = runner.executeStructureMap(
  "http://example.org/StructureMap/Patient",
  """{"name": "John Doe", "active": true}"""
)
```

## Building

### Prerequisites
- Gradle 8.4+
- JDK 11+
- Node.js 16+ (for JS targets)

### Build Commands

```bash
# Build all targets
gradle build

# Build JS only
gradle jsMainClasses

# Build JVM only
gradle jvmMainClasses

# Run tests
gradle test

# Run JS tests
gradle jsTest

# Run JVM tests
gradle jvmTest
```

## Integration with TypeScript Codebase

The existing TypeScript FmlRunner has been updated to use the Kotlin core via a bridge pattern:

1. **Kotlin Bridge** (`packages/fmlrunner/src/lib/kotlin-bridge.ts`)
   - Wraps Kotlin/JS compiled output
   - Provides TypeScript-friendly interface
   - Handles platform-specific logging and error handling

2. **Enhanced FmlRunner** (`packages/fmlrunner/src/index-with-kotlin.ts`)
   - Uses Kotlin core for FML compilation and execution
   - Maintains TypeScript services for extended functionality
   - Provides backward compatibility

## Future Enhancements

1. **Full HAPI FHIR Integration**
   - Add complete HAPI FHIR dependencies
   - Implement advanced FHIRPath evaluation
   - Support complex FHIR resource validation

2. **JavaScript FHIRPath Engine**
   - Integrate with existing Node.js fhirpath library
   - Provide feature parity between platforms

3. **Advanced StructureMap Features**
   - Support for dependent rules
   - Complex transformation functions
   - Nested group execution

4. **Performance Optimization**
   - Compilation caching
   - Execution optimization
   - Memory management improvements

## Benefits

1. **Code Reuse**: Single implementation of core logic
2. **Consistency**: Same behavior across platforms
3. **Maintainability**: Single source of truth for business logic
4. **Type Safety**: Shared type definitions
5. **Testing**: Common test suite for all platforms

## Examples

See `src/commonTest/kotlin/org/litlfred/fmlrunner/FmlRunnerTest.kt` for comprehensive examples of:
- FML compilation
- StructureMap execution
- Error handling
- Cross-platform compatibility testing