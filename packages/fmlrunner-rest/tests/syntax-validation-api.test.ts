import request from 'supertest';
import { FmlRunnerApi } from '../src/api';

describe('FML Syntax Validation REST API', () => {
  let api: FmlRunnerApi;
  let app: any;

  beforeEach(() => {
    api = new FmlRunnerApi();
    app = api.getApp();
  });

  describe('POST /api/v1/validate-syntax', () => {
    test('should validate correct FML syntax', async () => {
      const validFml = `map "http://example.org/StructureMap/Test" = "TestMap"

group main(source src, target tgt) {
  src.name -> tgt.fullName;
}`;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: validFml })
        .expect(200);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue).toBeDefined();
      expect(response.body.issue[0].severity).toBe('information');
      expect(response.body.issue[0].diagnostics).toBe('FML syntax is valid');
    });

    test('should detect syntax errors with proper FHIR format', async () => {
      const invalidFml = `map = "TestMap"`; // Missing URL

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: invalidFml })
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue).toBeDefined();
      
      const errorIssues = response.body.issue.filter((issue: any) => issue.severity === 'error');
      expect(errorIssues.length).toBeGreaterThan(0);

      // Check that error issues have proper structure
      errorIssues.forEach((issue: any) => {
        expect(issue.code).toBeDefined();
        expect(issue.diagnostics).toBeDefined();
        expect(issue.location).toBeDefined();
        expect(issue.location[0]).toMatch(/line \d+, column \d+/);
      });
    });

    test('should handle warnings properly', async () => {
      const fmlWithWarnings = `map "not-a-valid-url" = "TestMap"

group main(source src, target tgt) {
  src.name -> tgt.fullName;
}`;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: fmlWithWarnings })
        .expect(200); // Should be OK since it's just warnings

      expect(response.body.resourceType).toBe('OperationOutcome');
      
      const warningIssues = response.body.issue.filter((issue: any) => issue.severity === 'warning');
      expect(warningIssues.length).toBeGreaterThan(0);
    });

    test('should return 400 for missing fmlContent', async () => {
      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({})
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].severity).toBe('error');
      expect(response.body.issue[0].code).toBe('invalid');
      expect(response.body.issue[0].diagnostics).toContain('fmlContent');
    });

    test('should handle empty content gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: ' ' }) // Send space instead of empty string to bypass input validation
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      
      const errorIssues = response.body.issue.filter((issue: any) => issue.severity === 'error');
      expect(errorIssues.length).toBeGreaterThan(0);
      // The error will be about missing map declaration
      expect(errorIssues[0].diagnostics).toContain('map');
    });

    test('should provide detailed location information', async () => {
      const multiLineFml = `map "http://example.org/StructureMap/Test" = "TestMap"

group main(source src, target tgt) {
  src.name -> tgt.fullName;
}
// Line 7: syntax error here
group invalid(source src, target tgt {
  src.name -> tgt.fullName;
}`;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: multiLineFml })
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      
      const errorIssues = response.body.issue.filter((issue: any) => issue.severity === 'error');
      expect(errorIssues.length).toBeGreaterThan(0);

      // Check that at least one error has location information pointing to a reasonable line
      const hasGoodLocation = errorIssues.some((issue: any) => {
        const locationMatch = issue.location?.[0]?.match(/line (\d+)/);
        return locationMatch && parseInt(locationMatch[1]) >= 7; // Error should be around line 7-8
      });
      expect(hasGoodLocation).toBe(true);
    });

    test('should include error codes in extensions', async () => {
      const invalidFml = `invalid content`;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: invalidFml })
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      
      const errorIssues = response.body.issue.filter((issue: any) => issue.severity === 'error');
      expect(errorIssues.length).toBeGreaterThan(0);

      // Check that at least one error has an extension with error code
      const hasErrorCode = errorIssues.some((issue: any) => 
        issue.extension && 
        issue.extension.some((ext: any) => 
          ext.url === 'http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-code' &&
          ext.valueString
        )
      );
      expect(hasErrorCode).toBe(true);
    });

    test('should handle complex FML structures', async () => {
      const complexFml = `map "http://example.org/StructureMap/Test" = "TestMap"

uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
uses "http://example.org/StructureDefinition/MyPatient" alias MyPatient as target

imports "http://example.org/other-map"

prefix system = "http://example.org/system"

conceptmap "http://example.org/ConceptMap/test" {
  prefix s = "http://source.system"
  prefix t = "http://target.system"
  
  s:code1 -> t:mappedCode1
}

group main(source src : Patient, target tgt : MyPatient) {
  src.name -> tgt.fullName;
  src.gender -> tgt.sex;
}

group secondary(source src, target tgt) {
  src.birthDate -> tgt.dateOfBirth;
}`;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: complexFml })
        .expect(200);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].severity).toBe('information');
      expect(response.body.issue[0].diagnostics).toBe('FML syntax is valid');
    });
  });
});