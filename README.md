# FML Runner

A Node.js library for compiling and executing FHIR Mapping Language (FML) files to transform healthcare data using FHIR StructureMaps.

## Overview

FML Runner is designed as a library component for larger application frameworks, providing core functionality to:

1. **Compile** FHIR Mapping Language (FML) content into FHIR StructureMap resources (JSON format)
2. **Execute** StructureMaps on input content to perform data transformations
3. **Retrieve** StructureMaps from various sources (local directories, remote URLs)
4. **Optimize** performance for repeated executions of the same StructureMap

## Project Objectives

- Provide a clean, well-designed API for FML compilation and execution
- Support microservice architecture patterns through OpenAPI specifications
- Enable efficient data transformation workflows in healthcare applications
- Maintain separation of concerns for integration into larger frameworks
- Support both local and remote StructureMap retrieval mechanisms

## Documentation

This project includes focused requirements documentation:

- [`REQUIREMENTS.md`](./docs/REQUIREMENTS.md) - Core functional requirements and specifications
- [`api.yaml`](./docs/api.yaml) - OpenAPI 3.0 specification for all endpoints

## Implementation Status

Requirements documentation complete. Implementation in progress using a phased approach.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

Please refer to the requirements documents in the `docs/` directory for implementation guidelines and specifications.