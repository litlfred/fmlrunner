# Test Suite Overview

The FML Execution Validation Test Suite consists of test cases designed to validate FHIR Mapping Language implementations against real-world scenarios.

## TestPlan Structure

The test suite is defined using a FHIR TestPlan resource: `FMLExecutionValidationTestPlan`

### Test Case Organization

Each test case in the TestPlan includes:

- **Unique Identifier**: Distinguishes between different test scenarios
- **Sequence Number**: Orders test execution
- **Scope**: References the StructureMap being tested  
- **Test Run**: Defines the execution narrative and test data
- **Test Data**: Input and expected output resources
- **Assertions**: FHIRPath expressions for validation

## Test Case Categories

### Matchbox Test Cases
Test cases imported from the ahdis/matchbox repository, prefixed with `matchbox-`:

- Focus on practical mapping scenarios
- Real-world use cases from production systems
- Comprehensive input/output validation

### FHIR Test Cases  
Test cases from the official FHIR test suite, prefixed with `fhir-`:

- Official specification test cases
- Tutorial and educational examples
- Specification compliance validation

## Assertion Strategy

Test assertions use FHIRPath expressions to validate:

1. **Transformation Success**: Verify mapping execution completed
2. **Output Structure**: Confirm expected resource types are produced
3. **Data Correctness**: Validate specific field mappings
4. **Edge Cases**: Test boundary conditions and error handling

## Test Data Organization

Test data is organized in the `input/testdata/` directory:

```
input/testdata/
├── matchbox/
│   ├── qr2patgender/
│   │   ├── qr2patgender.map
│   │   ├── qr-input.json
│   │   └── patient-output.json
│   └── test-cases-metadata.json
└── fhir-test-cases/
    ├── tutorial-step1/
    │   ├── tutorial-step1.map
    │   └── tutorial-input.json
    └── test-cases-metadata.json
```

Each test case group contains:
- **`.map` file**: FML mapping specification
- **`*-input.*` file**: Source FHIR resource to transform
- **`*-output.*` file**: Expected transformation result (when available)

## Running Tests

To execute the test suite:

1. Load the TestPlan resource into your FHIR server
2. Execute each test case using your FML engine
3. Compare actual outputs against expected results
4. Validate assertions using FHIRPath evaluation

## Extending the Test Suite

New test cases can be added by:

1. Adding test data to the appropriate directory
2. Updating the metadata JSON files
3. Regenerating the TestPlan using the import scripts
4. Rebuilding the Implementation Guide