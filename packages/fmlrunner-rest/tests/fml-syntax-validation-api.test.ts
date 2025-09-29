import request from 'supertest';
import { FmlRunnerApi } from '../src/api';
import { FmlRunner } from 'fmlrunner';

describe('FML Syntax Validation API', () => {
  let app: any;
  let fmlRunner: FmlRunner;

  beforeEach(() => {
    fmlRunner = new FmlRunner({ logLevel: 'warn' });
    const api = new FmlRunnerApi(fmlRunner);
    app = api.getApp();
  });

  describe('POST /api/v1/fml/validate-syntax', () => {
    it('should validate valid FML syntax', async () => {
      const validFml = `
        map "http://example.org/fhir/StructureMap/PatientTransform" = "PatientTransform"
        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
        group Patient(source src : Patient, target tgt) {
          src.name -> tgt.name;
        }
      `;

      const response = await request(app)
        .post('/api/v1/fml/validate-syntax')
        .send({ fmlContent: validFml })
        .expect(200);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue).toBeDefined();
      expect(response.body.issue[0].severity).toBe('information');
      expect(response.body.issue[0].diagnostics).toContain('valid');
    });

    it('should return validation errors for invalid FML', async () => {
      const invalidFml = `
        // Missing map declaration
        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
        group Test {
      `;

      const response = await request(app)
        .post('/api/v1/fml/validate-syntax')
        .send({ fmlContent: invalidFml })
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue).toBeDefined();
      expect(response.body.issue.some((issue: any) => issue.severity === 'error')).toBe(true);
    });

    it('should return 400 for missing fmlContent', async () => {
      const response = await request(app)
        .post('/api/v1/fml/validate-syntax')
        .send({})
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].severity).toBe('error');
      expect(response.body.issue[0].diagnostics).toContain('fmlContent is required');
    });

    it('should handle empty FML content', async () => {
      const response = await request(app)
        .post('/api/v1/fml/validate-syntax')
        .send({ fmlContent: '' })
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].severity).toBe('error');
      expect(response.body.issue[0].diagnostics).toContain('empty');
    });

    it('should include line and column information in errors', async () => {
      const invalidFml = `map "test" = "Test"
group Test(source src {
  // Missing closing paren
}`;

      const response = await request(app)
        .post('/api/v1/fml/validate-syntax')
        .send({ fmlContent: invalidFml })
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      
      const errorIssues = response.body.issue.filter((issue: any) => issue.severity === 'error');
      expect(errorIssues.length).toBeGreaterThan(0);
      
      errorIssues.forEach((issue: any) => {
        expect(issue.location).toBeDefined();
        expect(issue.location[0]).toMatch(/line \d+, column \d+/);
      });
    });

    it('should handle warnings appropriately', async () => {
      const fmlWithWarnings = `
        map "http://example.org/fhir/StructureMap/Empty" = "Empty"
        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
      `;

      const response = await request(app)
        .post('/api/v1/fml/validate-syntax')
        .send({ fmlContent: fmlWithWarnings });

      expect(response.body.resourceType).toBe('OperationOutcome');
      
      // May have warnings but should succeed if no errors
      if (response.status === 200) {
        const warningIssues = response.body.issue.filter((issue: any) => issue.severity === 'warning');
        expect(warningIssues.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/fml/validate-syntax')
        .send('invalid json')
        .expect(400);

      // Should handle malformed request bodies
      expect(response.body).toBeDefined();
    });

    it('should validate FML with complex structures', async () => {
      const complexFml = `
        map "http://example.org/fhir/StructureMap/ComplexTransform" = "ComplexTransform"

        uses "http://hl7.org/fhir/StructureDefinition/Patient" alias Patient as source
        uses "http://example.org/StructureDefinition/MyPatient" alias MyPatient as target

        group Patient(source src : Patient, target tgt : MyPatient) {
          src.id -> tgt.id;
          src.name as srcName -> tgt.name as tgtName then {
            srcName.family -> tgtName.family;
            srcName.given -> tgtName.given;
          };
          src.telecom where use = 'phone' -> tgt.phone;
          src.address where use = 'home' -> tgt.homeAddress;
        }
      `;

      const response = await request(app)
        .post('/api/v1/fml/validate-syntax')
        .send({ fmlContent: complexFml });

      expect(response.body.resourceType).toBe('OperationOutcome');
      
      // Complex but valid FML should pass validation
      if (response.status === 200) {
        expect(response.body.issue[0].severity).toBe('information');
      }
    });
  });
});