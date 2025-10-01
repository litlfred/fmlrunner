# FML Execution Validation Test Suite

This directory contains a comprehensive FHIR IG-based validation test suite for FML (FHIR Mapping Language) using FHIR TestPlan resources.

## Overview

The test suite validates FML execution capabilities using real-world test cases sourced from community FML projects, with proper license compliance and attribution.

## Directory Structure

```
input/
├── fsh/
│   └── tests/
│       └── FMLExecutionValidationTestPlan.fsh    # FSH TestPlan definition
└── testdata/                                     # All test data with license attribution
    ├── examples/                                 # Local example test cases
    │   ├── patient-transform.map                 # Example FML mapping
    │   ├── patient-input.json                    # Example input data
    │   └── patient-output.json                   # Expected output data
    ├── fhir-test-cases/                         # Test cases from FHIR/fhir-test-cases
    └── matchbox/                                 # Test cases from ahdis/matchbox
```

## Test Data Sources

### Local Examples (`input/testdata/examples/`)
- **License**: MIT (local examples)
- **Purpose**: Immediate testing and development
- **Files**: Basic patient transformation examples

### FHIR Test Cases (`input/testdata/fhir-test-cases/`)
- **Source**: [FHIR/fhir-test-cases/r5/structure-mapping](https://github.com/FHIR/fhir-test-cases/tree/main/r5/structure-mapping)
- **License**: HL7 FHIR License (CC0 "No Rights Reserved")
- **Attribution**: HL7 FHIR trademark acknowledgment included

### Matchbox Test Cases (`input/testdata/matchbox/`)
- **Source**: [ahdis/matchbox test resources](https://github.com/ahdis/matchbox/tree/main/matchbox-server/src/test/resources)
- **License**: Apache License 2.0
- **Attribution**: Apache 2.0 license header included

## Test File Mapping

Test cases follow these naming conventions:
- `*-map.txt` or `*.map` — FML mapping specification
- `*-input.json` or `*-input.xml` — FHIR resource to be mapped
- `*-output.json` or `*-output.xml` — Expected output after applying the map

Files are paired by base name (e.g., `patient-transform.map`, `patient-input.json`, `patient-output.json`).

## Usage

### Import Test Data

```bash
# Import test cases from external repositories
npm run import:test-data

# Explore available test files in repositories
npm run explore:test-repos
```

### TestPlan Structure

The `FMLExecutionValidationTestPlan` defines:
- **Test Cases**: Each mapping scenario with input/output validation
- **Test Data**: References to map files, input data, and expected outputs
- **Dependencies**: FHIR R5 StructureMap specification requirements
- **Validation**: Test execution expectations and requirements

## License Compliance

All imported files include proper license attribution:

- **FHIR Test Cases**: HL7 copyright and CC0 license
- **Matchbox Test Cases**: Apache 2.0 license 
- **Local Examples**: MIT license

License headers are automatically added by the import script to ensure compliance with original contribution requirements.

## Development

### Adding New Test Cases

1. Place test files in appropriate subdirectory under `input/testdata/`
2. Ensure proper license attribution headers
3. Update `FMLExecutionValidationTestPlan.fsh` with new test case definitions

### Test Execution

Test execution will be available through:
- FHIR IG publisher validation
- FML Runner library test suites
- Continuous integration workflows

## Published Documentation

When published, the test plan documentation will be available at:
**https://litlfred.github.io/fmlrunner/TestPlan/FMLExecutionValidationTestPlan.html**

This provides comprehensive documentation of all test cases, validation requirements, and execution results for the FML execution validation test suite.