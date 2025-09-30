# FML Runner

A Kotlin Multiplatform library for compiling and executing FHIR Mapping Language (FML) files to transform healthcare data using FHIR StructureMaps.

## Overview

FML Runner provides a shared core business logic implementation using Kotlin Multiplatform, enabling:

1. **Cross-Platform Compilation** - FHIR Mapping Language (FML) content compilation using shared Kotlin core
2. **Universal Execution** - StructureMap execution with kotlin-fhirpath integration
3. **FHIR Terminology Management** - ConceptMaps, ValueSets, CodeSystems with consistent behavior
4. **Bundle Processing** - FHIR Bundle operations across all platforms
5. **Performance Optimization** - Intelligent caching and shared implementation

## Architecture

### Shared Core (Kotlin Multiplatform)
- **FML Compiler**: Tokenization and parsing logic using Kotlin
- **StructureMap Executor**: Transformation engine with kotlin-fhirpath support
- **FHIR Types**: Shared data structures and interfaces
- **Terminology Services**: Cross-platform resource management

### Platform-Specific Features
- **JVM/Android**: Native Kotlin performance with full FHIR ecosystem integration
- **JavaScript/Node.js**: Compiled Kotlin/JS for web and server-side execution

## Building

### Prerequisites

- **JDK**: 11 or higher
- **Gradle**: 8.4 or higher
- **Node.js**: 16+ (for JavaScript targets)

### Build Commands

```bash
# Build all targets (JVM + JavaScript)
gradle build

# Build JVM only
gradle jvmMainClasses

# Build JavaScript only  
gradle jsMainClasses

# Run all tests
gradle test

# Run JVM tests only
gradle jvmTest

# Run JavaScript/Node.js tests only
gradle jsNodeTest

# Clean build artifacts
gradle clean
```
## Usage

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

### From JavaScript/Node.js

When built for JavaScript, the same API is available:

```javascript
const { FmlRunner } = require('fmlrunner');

const runner = new FmlRunner();

// Compile and execute FML
const result = runner.compileFml(`
  map "http://example.org/StructureMap/Patient" = "PatientTransform"
  
  group main(source src, target tgt) {
    src.name -> tgt.fullName;
    src.active -> tgt.isActive;
  }
`);

const execResult = runner.executeStructureMap(
  "http://example.org/StructureMap/Patient",
  JSON.stringify({name: "John Doe", active: true})
);
```

## Development

### Project Structure

```
fmlrunner/
├── src/
│   ├── commonMain/kotlin/          # Shared Kotlin code for all platforms
│   │   └── org/litlfred/fmlrunner/
│   │       ├── FmlRunner.kt        # Main API
│   │       ├── compiler/           # FML compilation logic
│   │       ├── executor/           # StructureMap execution
│   │       ├── terminology/       # FHIR terminology services
│   │       └── types/              # FHIR data types
│   ├── jvmMain/kotlin/             # JVM-specific implementations
│   ├── jsMain/kotlin/              # JavaScript-specific implementations
│   ├── commonTest/kotlin/          # Shared tests
│   ├── jvmTest/kotlin/             # JVM-specific tests
│   └── jsTest/kotlin/              # JavaScript-specific tests
├── build.gradle.kts                # Kotlin Multiplatform build configuration
└── build/                          # Generated build artifacts
```

### Development Workflow

```bash
# Install dependencies and setup project
gradle build

# Run all tests (JVM + JavaScript)
gradle jvmTest jsNodeTest

# Start development with auto-rebuild
gradle build --continuous

# Run specific platform tests
gradle jvmTest    # JVM tests only  
gradle jsNodeTest # JavaScript/Node.js tests only

# Generate documentation
gradle dokkaHtml
```

## Key Features

### FHIR Mapping Language Support
- **Complete FML parser** with proper tokenization and grammar handling using Kotlin
- **Cross-platform compilation** - same FML parsing logic on JVM and JavaScript
- **Robust parsing** with graceful error recovery and validation

### FHIR Terminology Ecosystem  
- **ConceptMap operations**: CRUD + translation with equivalence mapping
- **ValueSet operations**: CRUD + expansion and code validation
- **CodeSystem operations**: CRUD + code lookup and validation
- **StructureDefinition management**: Cross-platform validation support
- **Bundle processing**: Bulk resource operations

### Advanced Execution Engine
- **kotlin-fhirpath integration** ready for cross-platform FHIRPath evaluation
- **Terminology-aware transformations** with ConceptMap integration
- **Validation support** with strict/non-strict execution modes
- **Memory-efficient caching** for repeated executions

### Developer Experience
- **Kotlin Multiplatform**: Write once, run on JVM and JavaScript
- **Type Safety**: Full Kotlin type definitions across platforms
- **Comprehensive testing**: Platform-specific and shared test coverage
- **Performance**: Native performance on JVM, optimized JavaScript compilation

## Testing

The project includes comprehensive test coverage across platforms:

- **FML Compilation Tests**: Parser validation and StructureMap generation
- **Execution Tests**: Transformation logic and cross-platform behavior
- **Terminology Tests**: ConceptMap, ValueSet, CodeSystem operations
- **Platform Tests**: JVM and JavaScript specific functionality

Run specific test suites:
```bash
# Run all tests (JVM + JavaScript)
gradle jvmTest jsNodeTest

# Run JVM tests only
gradle jvmTest

# Run JavaScript/Node.js tests only 
gradle jsNodeTest

# Run with verbose output
gradle test --info

# Run specific test class
gradle jvmTest --tests "FmlRunnerTest"
```

## API Reference

### Core FmlRunner API

```kotlin
class FmlRunner {
    // Core compilation and execution
    fun compileFml(fmlContent: String): FmlCompilationResult
    fun executeStructureMap(reference: String, inputContent: String): ExecutionResult
    
    // Resource management
    fun registerStructureMap(structureMap: StructureMap): Boolean
    fun getStructureMap(reference: String): StructureMap?
    fun searchStructureMaps(name: String?, status: StructureMapStatus?, url: String?): List<StructureMap>
    
    // Terminology operations
    fun registerConceptMap(conceptMap: ConceptMap)
    fun translateCode(sourceSystem: String, sourceCode: String, targetSystem: String?): List<TranslationResult>
    fun registerValueSet(valueSet: ValueSet) 
    fun validateCodeInValueSet(code: String, system: String?, valueSetUrl: String?): ValidationResult
    fun registerCodeSystem(codeSystem: CodeSystem)
    fun lookupCode(system: String, code: String): LookupResult?
    
    // Bundle operations
    fun processBundle(bundle: Bundle): BundleProcessingResult
    fun getBundleStats(): BundleStats
}
```

## Implementation Status

✅ **Complete Kotlin Multiplatform implementation**:
- Robust FML parser with complete tokenization and parsing
- Cross-platform StructureMap execution engine
- Comprehensive FHIR terminology services  
- Platform-specific optimizations (JVM + JavaScript)
- Ready for kotlin-fhirpath integration
- Comprehensive test coverage across platforms
- Type-safe APIs with serialization support

**Test Results**: All platform tests passing (JVM + JavaScript/Node.js)

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

Please refer to the requirements documents in the `docs/` directory for implementation guidelines and specifications. All contributions should maintain the existing test coverage and follow the established Kotlin coding patterns.