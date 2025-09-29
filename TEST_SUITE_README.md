# FML Execution Validation Test Suite

A comprehensive FHIR Implementation Guide defining a test suite for validating FHIR Mapping Language (FML) execution using real-world test cases.

## Overview

This test suite provides a standardized way to validate FML implementations using:
- Real-world test cases from the ahdis/matchbox project
- Official FHIR test cases from FHIR/fhir-test-cases repository
- FHIR TestPlan resources for structured test execution
- Comprehensive licensing compliance for all imported content

## Quick Start

### Prerequisites

- [SUSHI](https://fshschool.org/docs/sushi/) (FHIR Shorthand IG generator)
- [FHIR IG Publisher](https://confluence.hl7.org/display/FHIR/IG+Publisher+Documentation)
- Node.js (for test data import scripts)

### Building the Implementation Guide

1. **Clone the repository**
   ```bash
   git clone https://github.com/litlfred/fmlrunner.git
   cd fmlrunner
   ```

2. **Generate the IG**
   ```bash
   # Compile FSH files
   sushi
   
   # Generate the full IG
   _genonce.sh  # or .bat on Windows
   ```

3. **Import additional test data** (optional)
   ```bash
   node scripts/test-data-import/import-all.js
   ```

## Directory Structure

```
input/
├── fsh/
│   └── tests/
│       └── FMLExecutionValidationTestPlan.fsh
├── testdata/
│   ├── matchbox/
│   │   ├── qr2patgender/
│   │   │   ├── qr2patgender.map
│   │   │   ├── qr-input.json
│   │   │   └── patient-output.json
│   │   └── test-cases-metadata.json
│   └── fhir-test-cases/
│       ├── tutorial-step1/
│       │   ├── tutorial-step1.map
│       │   └── tutorial-input.json
│       └── test-cases-metadata.json
└── pagecontent/
    ├── index.md
    ├── test-suite.md
    ├── test-data.md
    └── license-compliance.md
```

## Test Data Import

The test suite includes scripts to import test data from external repositories:

### Import from ahdis/matchbox
```bash
node scripts/test-data-import/import-matchbox.js
```

### Import from FHIR/fhir-test-cases
```bash
node scripts/test-data-import/import-fhir-test-cases.js
```

### Import all sources
```bash
node scripts/test-data-import/import-all.js
```

## Using the Test Suite

### For FML Engine Implementers

1. **Load the TestPlan**: Import the `FMLExecutionValidationTestPlan` resource
2. **Execute Test Cases**: Run each test case against your FML engine
3. **Validate Results**: Compare outputs against expected results
4. **Check Assertions**: Evaluate FHIRPath assertions for pass/fail status

### For Test Suite Maintainers

1. **Add Test Data**: Place new test files in appropriate directories
2. **Update Metadata**: Modify metadata JSON files to include new test cases
3. **Regenerate TestPlan**: Run import scripts to update the FSH TestPlan
4. **Rebuild IG**: Use SUSHI and IG Publisher to generate updated documentation

## Test Case Structure

Each test case includes:

- **Map File**: FML mapping specification (`.map` or `.fml`)
- **Input File**: Source FHIR resource (JSON or XML)
- **Output File**: Expected transformation result (when available)
- **Assertions**: FHIRPath expressions for validation

### Example Test Case

```
input/testdata/matchbox/qr2patgender/
├── qr2patgender.map          # FML mapping
├── qr-input.json            # Input QuestionnaireResponse
└── patient-output.json      # Expected Patient output
```

## License Compliance

The test suite incorporates content from multiple sources:

- **ahdis/matchbox**: Apache License 2.0
- **FHIR/fhir-test-cases**: HL7 FHIR License

All imported files include proper attribution headers. See [License Compliance](input/pagecontent/license-compliance.md) for details.

## Contributing

To contribute to the test suite:

1. **Add Test Cases**: Include proper licensing headers
2. **Update Documentation**: Describe new test scenarios
3. **Maintain Attribution**: Preserve all license information
4. **Test Changes**: Verify IG builds successfully

## File Naming Conventions

Test files follow these patterns:
- Map files: `*.map`, `*.fml`, `*-map.txt`
- Input files: `*-input.json`, `*-input.xml`, `*source*`
- Output files: `*-output.json`, `*-output.xml`, `*-expected.*`

## Building and Testing

### Build the IG
```bash
# Quick build
sushi

# Full build with publisher
./_genonce.sh
```

### Validate FSH
```bash
sushi -s
```

### Update test data
```bash
node scripts/test-data-import/import-all.js
sushi
```

## Support

For questions or issues:
- Review the [Implementation Guide](https://litlfred.github.io/fmlrunner/) documentation
- Check existing [GitHub Issues](https://github.com/litlfred/fmlrunner/issues)
- Create a new issue for bugs or feature requests

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

Individual test cases are licensed under their original terms (Apache 2.0 or HL7 FHIR License) as documented in each file.