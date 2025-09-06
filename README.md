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

## Documentation Structure

This project includes several focused requirements documents:

- [`FUNCTIONAL_REQUIREMENTS.md`](./docs/FUNCTIONAL_REQUIREMENTS.md) - Detailed functional specifications
- [`API_REQUIREMENTS.md`](./docs/API_REQUIREMENTS.md) - API design and OpenAPI specifications
- [`ARCHITECTURE_REQUIREMENTS.md`](./docs/ARCHITECTURE_REQUIREMENTS.md) - System architecture and design patterns
- [`PERFORMANCE_REQUIREMENTS.md`](./docs/PERFORMANCE_REQUIREMENTS.md) - Performance and optimization requirements
- [`DEPLOYMENT_REQUIREMENTS.md`](./docs/DEPLOYMENT_REQUIREMENTS.md) - Deployment and integration guidelines

## Quick Start

*Note: This section will be populated once the library is implemented according to the requirements specifications.*

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

Please refer to the requirements documents in the `docs/` directory for implementation guidelines and specifications.