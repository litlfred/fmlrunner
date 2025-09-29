# Test Data Sources

This page documents the sources of test data used in the FML Execution Validation Test Suite and the licensing requirements for their use.

## ahdis/matchbox Repository

### Source Information
- **Repository**: https://github.com/ahdis/matchbox
- **Path**: `matchbox-server/src/test/resources`
- **License**: Apache License 2.0
- **Maintainer**: ahdis

### Content Description
The matchbox repository provides a comprehensive FHIR server implementation with extensive FML mapping capabilities. The test resources include:

- Real-world mapping scenarios
- Complex transformation use cases
- Production-tested FML specifications
- Comprehensive input/output test pairs

### License Requirements
All files imported from the matchbox repository include the following attribution header:

```
Source: ahdis/matchbox repository
URL: https://github.com/ahdis/matchbox/tree/main/matchbox-server/src/test/resources
License: Apache License 2.0

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## FHIR/fhir-test-cases Repository

### Source Information
- **Repository**: https://github.com/FHIR/fhir-test-cases
- **Path**: `r5/structure-mapping`
- **License**: HL7 FHIR License
- **Maintainer**: HL7 FHIR Project

### Content Description
The FHIR test cases repository contains official test cases for FHIR specification compliance, including:

- Official structure mapping examples
- Tutorial and educational content
- Specification compliance test cases
- Reference implementations

### License Requirements
All files imported from the FHIR test cases repository include the following attribution header:

```
Source: FHIR/fhir-test-cases repository
URL: https://github.com/FHIR/fhir-test-cases/tree/main/r5/structure-mapping

(c) 2011+ HL7 FHIR Project

Licensed under the HL7 FHIR License - see LICENSE.txt at the root of this repository.
The original content is licensed under the HL7 FHIR License.

This content contains test cases and mapping specifications from the 
official FHIR test suite, used here under the terms of the HL7 license
for testing and validation purposes.
```

## File Naming Conventions

### Common Patterns
Test files follow these naming conventions to enable automatic mapping between related files:

- **Map files**: `*-map.txt`, `*.map`, `*.fml`
- **Input files**: `*-input.json`, `*-input.xml`, `*source*`
- **Output files**: `*-output.json`, `*-output.xml`, `*-expected.*`, `*target*`

### Grouping Strategy
Files are grouped by base name after removing common suffixes:
- `patient-map.txt`, `patient-input.json`, `patient-output.json` → `patient` group
- `tutorial-step1.map`, `tutorial-step1-source.json` → `tutorial-step1` group

## Import Process

The test data import process:

1. **Discovery**: Scan source repositories for relevant test files
2. **Categorization**: Group related files by naming conventions
3. **Attribution**: Add appropriate license headers to all files
4. **Organization**: Store files in organized directory structure
5. **Metadata**: Generate metadata files for test case mapping

## Compliance Statement

This test suite uses content from open source FHIR projects under their respective licenses. All original license terms are preserved and attribution is provided as required. The content is used for testing and validation purposes in accordance with the original license terms.

Users of this test suite must:
- Preserve all license headers and attribution
- Comply with the terms of the Apache 2.0 and HL7 FHIR licenses
- Not remove or modify attribution information
- Respect the original copyright holders' rights