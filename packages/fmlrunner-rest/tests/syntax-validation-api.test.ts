import request from 'supertest';
import express from 'express';
import { FmlRunnerApi } from '../src/api';
import { FmlRunner } from 'fmlrunner';

describe('FML Syntax Validation REST API', () => {
  let app: express.Application;

  beforeAll(() => {
    const fmlRunner = new FmlRunner({ logLevel: 'error' });
    const api = new FmlRunnerApi(fmlRunner);
    app = api.getApp();
  });

  describe('POST /api/v1/validate-syntax', () => {
    it('should validate correct FML syntax', async () => {
      const validFml = `
        map "http://example.org/StructureMap/test" = "TestMap"

        group main(source src, target tgt) {
          src.name -> tgt.name;
        }
      `;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: validFml })
        .expect(200);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue).toEqual([]);
    });

    it('should return validation errors for empty content', async () => {
      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: '   ' }) // Send whitespace instead of empty
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue).toHaveLength(1);
      expect(response.body.issue[0].severity).toBe('error');
      expect(response.body.issue[0].diagnostics).toContain('cannot be empty');
    });

    it('should return warnings for content without map declaration', async () => {
      const fmlWithoutMap = `
        group main(source src, target tgt) {
          src.name -> tgt.name;
        }
      `;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: fmlWithoutMap })
        .expect(200);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue).toHaveLength(1);
      expect(response.body.issue[0].severity).toBe('warning');
      expect(response.body.issue[0].diagnostics).toContain('map');
    });

    it('should return 400 for missing fmlContent', async () => {
      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({})
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
      expect(response.body.issue[0].severity).toBe('error');
      expect(response.body.issue[0].diagnostics).toContain('fmlContent is required');
    });

    it('should include location information in errors', async () => {
      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: '   ' }) // Send whitespace to trigger syntax validation
        .expect(400);

      expect(response.body.issue[0]).toHaveProperty('location');
      expect(response.body.issue[0].location[0]).toContain('line');
      expect(response.body.issue[0].location[0]).toContain('column');
    });

    it('should handle server errors gracefully', async () => {
      // Test with null to potentially trigger an error
      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: null })
        .expect(400);

      expect(response.body.resourceType).toBe('OperationOutcome');
    });
  });
});