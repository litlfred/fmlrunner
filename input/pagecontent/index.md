# FML Execution Validation Test Suite

This Implementation Guide defines a comprehensive test suite for validating FHIR Mapping Language (FML) execution using real-world test cases sourced from community FML projects.

## Purpose

The FML Execution Validation Test Suite is designed to:

1. **Validate FML Implementation Correctness**: Ensure that FML engines correctly implement the FHIR Mapping Language specification
2. **Provide Real-World Test Cases**: Use actual mapping scenarios from community projects to test practical use cases  
3. **Enable Regression Testing**: Support continuous validation of FML engines across different versions
4. **Facilitate Compliance Testing**: Help implementers verify their FML engines meet specification requirements

## Test Data Sources

The test suite incorporates test cases from two primary sources:

### ahdis/matchbox Repository
- **Source**: [ahdis/matchbox test resources](https://github.com/ahdis/matchbox/tree/main/matchbox-server/src/test/resources)
- **License**: Apache License 2.0
- **Content**: Real-world mapping scenarios and test cases used in the Matchbox FHIR server

### FHIR/fhir-test-cases Repository  
- **Source**: [FHIR structure-mapping test cases](https://github.com/FHIR/fhir-test-cases/tree/main/r5/structure-mapping)
- **License**: HL7 FHIR License
- **Content**: Official FHIR test cases for structure mapping functionality

## Test Suite Structure

The test suite is organized using FHIR TestPlan resources that define:

- **Test Cases**: Individual mapping scenarios with input/output validation
- **Test Data**: Input FHIR resources and expected output resources
- **Assertions**: FHIRPath expressions to validate transformation results
- **Metadata**: Attribution and licensing information for all test data

## Implementation

Test implementers can use this test suite to:

1. Validate their FML engine implementation
2. Perform regression testing during development
3. Verify compliance with FHIR Mapping Language specifications
4. Test edge cases and real-world scenarios

For more information about specific test cases and implementation guidance, see the [Test Suite Overview](test-suite.html) and [Test Data Sources](test-data.html) pages.