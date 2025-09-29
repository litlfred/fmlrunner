import request from 'supertest';
import { FmlRunnerApi } from '../src/api';
import { FmlRunner } from 'fmlrunner';

describe('FML Syntax Validation API', () => {
  let app: any;
  let fmlRunner: FmlRunner;

  beforeAll(() => {
    fmlRunner = new FmlRunner({ baseUrl: './tests/test-data' });
    const api = new FmlRunnerApi(fmlRunner);
    app = api.getApp();
  });

  describe('POST /api/v1/validate-syntax', () => {
    it('should validate valid FML content', async () => {
      const validFmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        }
      `;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: validFmlContent })
        .expect(200);

      expect(response.body.isValid).toBe(true);
      expect(response.body.errors).toEqual([]);
      expect(response.body.warnings).toEqual([]);
    });

    it('should detect syntax errors in FML content', async () => {
      const invalidFmlContent = `
        invalid "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        }
      `;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: invalidFmlContent })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(response.body.errors.some((e: any) => e.code === 'MISSING_MAP_KEYWORD')).toBe(true);
    });

    it('should return 400 for missing fmlContent', async () => {
      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('fmlContent is required');
    });

    it('should return 400 for empty fmlContent', async () => {
      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: '' })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some((e: any) => e.code === 'EMPTY_CONTENT')).toBe(true);
    });

    it('should detect unclosed braces', async () => {
      const invalidFmlContent = `
        map "http://example.org/tutorial" = tutorial
        
        group tutorial(source src : TutorialLeft, target tgt : TutorialRight) {
          src.a as a -> tgt.a = a;
        
      `;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: invalidFmlContent })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some((e: any) => e.code === 'UNCLOSED_BRACE')).toBe(true);
    });

    it('should provide detailed error information', async () => {
      const invalidFmlContent = `map "test" = test
      
      group test(source src, target tgt) {
        src.a -> tgt.b;
      }}`;

      const response = await request(app)
        .post('/api/v1/validate-syntax')
        .send({ fmlContent: invalidFmlContent })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.errors).toBeDefined();
      
      const unMatchedError = response.body.errors.find((e: any) => e.code === 'UNMATCHED_BRACE');
      expect(unMatchedError).toBeDefined();
      expect(unMatchedError.line).toBeDefined();
      expect(unMatchedError.column).toBeDefined();
      expect(unMatchedError.severity).toBe('error');
    });
  });
});