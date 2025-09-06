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

This project includes comprehensive requirements documentation organized into focused documents:

- [`REQUIREMENTS_SUMMARY.md`](./docs/REQUIREMENTS_SUMMARY.md) - **Start Here** - Complete overview and implementation roadmap
- [`FUNCTIONAL_REQUIREMENTS.md`](./docs/FUNCTIONAL_REQUIREMENTS.md) - Detailed functional specifications (14 requirements)
- [`API_REQUIREMENTS.md`](./docs/API_REQUIREMENTS.md) - API design and OpenAPI specifications (9 requirements)
- [`ARCHITECTURE_REQUIREMENTS.md`](./docs/ARCHITECTURE_REQUIREMENTS.md) - System architecture and design patterns (20 requirements)
- [`PERFORMANCE_REQUIREMENTS.md`](./docs/PERFORMANCE_REQUIREMENTS.md) - Performance and optimization requirements (26 requirements)
- [`DEPLOYMENT_REQUIREMENTS.md`](./docs/DEPLOYMENT_REQUIREMENTS.md) - Deployment and integration guidelines (26 requirements)
- [`openapi.yaml`](./docs/openapi.yaml) - Complete OpenAPI 3.0 specification with 12 endpoints

**Total: 95 specific requirements** covering all aspects of the FML Runner library.

## Quick Start

*Note: This section will be populated once the library is implemented according to the requirements specifications.*

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

Please refer to the requirements documents in the `docs/` directory for implementation guidelines and specifications.