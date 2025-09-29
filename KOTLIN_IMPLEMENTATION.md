# Kotlin/JS Core Implementation for FML Runner

## Overview

This implementation demonstrates how to share core FML (FHIR Mapping Language) business logic between Kotlin/JVM/Android and Node.js/JavaScript platforms using Kotlin Multiplatform with **kotlin-fhirpath** for cross-platform FHIRPath evaluation.

## Architecture

### Core Components

1. **FML Compiler** (`src/commonMain/kotlin/org/litlfred/fmlrunner/compiler/`)
   - Tokenizes FML syntax
   - Parses FML content into StructureMap JSON
   - Cross-platform implementation with shared parsing logic

2. **StructureMap Executor** (`src/commonMain/kotlin/org/litlfred/fmlrunner/executor/`)
   - Executes StructureMaps on input data
   - Uses **kotlin-fhirpath** for cross-platform FHIRPath evaluation
   - Provides validation and transformation capabilities

3. **FHIRPath Engine** (kotlin-fhirpath library)
   - Cross-platform FHIRPath evaluation using kotlin-fhirpath
   - Replaces Node.js fhirpath dependency entirely
   - Consistent FHIRPath behavior across JVM and JavaScript platforms

4. **Core Types** (`src/commonMain/kotlin/org/litlfred/fmlrunner/types/`)
   - Shared FHIR resource definitions
   - Serializable data structures
   - Common interfaces and enums

### Platform-Specific Implementations

#### JVM/Android
- Uses kotlin-fhirpath for full FHIRPath support
- Access to complete FHIR validation capabilities
- Can leverage additional Java ecosystem libraries

#### JavaScript/Node.js
- Compiles to JavaScript modules
- Uses kotlin-fhirpath compiled to JavaScript
- No dependency on Node.js fhirpath library

## Dependencies

### Kotlin Multiplatform
- **kotlin-fhirpath**: `com.github.jingtang10:kotlin-fhirpath:0.1.0`
- **kotlinx.serialization**: For cross-platform data serialization
- **kotlinx.datetime**: For date/time handling

### Removed Dependencies
- ❌ Node.js `fhirpath` library (replaced by kotlin-fhirpath)
- ❌ Custom FHIRPath implementations

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

// Execute transformation with kotlin-fhirpath
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

// Execute transformation with kotlin-fhirpath
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

## FHIRPath Integration

### kotlin-fhirpath Benefits
- **Cross-Platform**: Single FHIRPath implementation for all platforms
- **Consistent**: Same FHIRPath behavior on JVM and JavaScript
- **Maintained**: Official kotlin-fhir ecosystem library
- **Performance**: Optimized for each target platform

### Migration from Node.js fhirpath
- ✅ Removed `fhirpath` dependency from package.json
- ✅ Updated imports to use kotlin-fhirpath
- ✅ Updated TypeScript files to indicate Kotlin core usage
- ✅ Consistent FHIRPath evaluation across platforms

## Future Enhancements

1. **Full kotlin-fhir Integration**
   - Add complete kotlin-fhir dependencies
   - Implement advanced FHIR resource validation
   - Support complex FHIR operations

2. **Advanced StructureMap Features**
   - Support for dependent rules
   - Complex transformation functions
   - Nested group execution

3. **Performance Optimization**
   - Compilation caching
   - Execution optimization
   - Memory management improvements

## Benefits

1. **Code Reuse**: Single implementation of core logic using kotlin-fhirpath
2. **Consistency**: Same FHIRPath behavior across platforms
3. **Maintainability**: Single source of truth for business logic
4. **Type Safety**: Shared type definitions
5. **No Node.js Dependencies**: Fully self-contained Kotlin implementation

## Examples

See `src/commonTest/kotlin/org/litlfred/fmlrunner/FmlRunnerTest.kt` for comprehensive examples of:
- FML compilation
- StructureMap execution with kotlin-fhirpath
- Error handling
- Cross-platform compatibility testing