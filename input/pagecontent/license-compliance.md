# License Compliance

This page documents the licensing requirements and compliance measures for the FML Execution Validation Test Suite.

## License Overview

The test suite incorporates content from multiple sources under different licenses:

### Apache License 2.0 (ahdis/matchbox)
- **Scope**: Test cases from the matchbox FHIR server project
- **Requirements**: Attribution, license preservation, disclaimer inclusion
- **Commercial Use**: Permitted with proper attribution

### HL7 FHIR License (FHIR/fhir-test-cases)
- **Scope**: Official FHIR test cases and examples
- **Requirements**: Copyright notice, license terms preservation
- **Commercial Use**: Subject to HL7 license terms

## Compliance Measures

### Attribution Requirements
All imported files include comprehensive attribution headers containing:

1. **Source Repository**: URL and path to original content
2. **License Information**: Full license text or reference
3. **Copyright Notice**: Original copyright holder information
4. **Usage Statement**: Description of permitted use

### File Headers
Each imported file includes a header at the beginning with appropriate license information:

#### For Apache 2.0 Licensed Content (JSON/XML):
```
/*
 * Source: ahdis/matchbox repository
 * URL: https://github.com/ahdis/matchbox/tree/main/matchbox-server/src/test/resources
 * License: Apache License 2.0
 * 
 * [Full Apache 2.0 license text]
 */
```

#### For Apache 2.0 Licensed Content (FML/Map files):
```
//
// Source: ahdis/matchbox repository
// URL: https://github.com/ahdis/matchbox/tree/main/matchbox-server/src/test/resources
// License: Apache License 2.0
//
// [Full Apache 2.0 license text]
//
```

#### For HL7 Licensed Content:
```
/*
 * Source: FHIR/fhir-test-cases repository
 * URL: https://github.com/FHIR/fhir-test-cases/tree/main/r5/structure-mapping
 * 
 * (c) 2011+ HL7 FHIR Project
 * 
 * Licensed under the HL7 FHIR License - see LICENSE.txt at the root of this repository.
 * [Additional license terms]
 */
```

## Usage Rights

### What You Can Do
- Use the test suite for FML engine validation
- Incorporate test cases into your testing workflow
- Modify test cases for your specific needs (with attribution)
- Distribute the test suite with proper attribution

### What You Must Do
- Preserve all license headers and attribution
- Include copyright notices in any derivative works
- Comply with the original license terms
- Maintain the integrity of attribution information

### What You Cannot Do
- Remove or modify license headers
- Claim ownership of the original test content
- Use the content in ways prohibited by the original licenses
- Distribute without proper attribution

## Derivative Works

If you create derivative works based on this test suite:

1. **Preserve Attribution**: Keep all original license headers
2. **Document Changes**: Clearly mark any modifications made
3. **License Compatibility**: Ensure your license is compatible with the original licenses
4. **Additional Attribution**: Add your own attribution for new content

## Commercial Use

Commercial use of the test suite is permitted under the following conditions:

### Apache 2.0 Licensed Content
- Commercial use is explicitly permitted
- Attribution and license inclusion required
- No warranty or liability from original authors

### HL7 Licensed Content
- Commercial use subject to HL7 license terms
- May require additional permissions for certain uses
- Consult the HL7 FHIR license for specific requirements

## Reporting Issues

If you identify any license compliance issues:

1. **Contact**: Report issues to the test suite maintainers
2. **Documentation**: Provide details about the specific compliance concern
3. **Resolution**: Work with maintainers to address the issue promptly

## License Texts

Full license texts are available:
- **Apache 2.0**: https://www.apache.org/licenses/LICENSE-2.0
- **HL7 FHIR License**: https://github.com/FHIR/fhir-test-cases/blob/main/LICENSE.txt

## Disclaimer

This test suite is provided "as is" without warranty of any kind. The original license terms of all incorporated content continue to apply. Users are responsible for ensuring their use complies with all applicable license requirements.