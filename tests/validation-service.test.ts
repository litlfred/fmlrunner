import { ValidationService } from '../src/lib/validation-service';
import { StructureDefinition } from '../src/types';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('registerStructureDefinition', () => {
    it('should register StructureDefinition by URL', () => {
      const structureDefinition: StructureDefinition = {
        resourceType: 'StructureDefinition',
        url: 'http://example.org/StructureDefinition/Patient',
        name: 'Patient',
        status: 'active',
        kind: 'resource',
        type: 'Patient'
      };

      validationService.registerStructureDefinition(structureDefinition);
      const definitions = validationService.getStructureDefinitions();
      
      expect(definitions.length).toBeGreaterThanOrEqual(1);
      expect(definitions[0].name).toBe('Patient');
    });

    it('should register StructureDefinition by name', () => {
      const structureDefinition: StructureDefinition = {
        resourceType: 'StructureDefinition',
        name: 'TestProfile',
        status: 'draft',
        kind: 'logical',
        type: 'TestResource'
      };

      validationService.registerStructureDefinition(structureDefinition);
      const definitions = validationService.getStructureDefinitions();
      
      expect(definitions).toHaveLength(1);
      expect(definitions[0].name).toBe('TestProfile');
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      const structureDefinition: StructureDefinition = {
        resourceType: 'StructureDefinition',
        url: 'http://example.org/StructureDefinition/Patient',
        name: 'Patient',
        status: 'active',
        kind: 'resource',
        type: 'Patient',
        snapshot: {
          element: [
            {
              path: 'Patient',
              min: 1,
              max: '1'
            },
            {
              path: 'Patient.name',
              min: 1,
              max: '*',
              type: [{ code: 'string' }]
            },
            {
              path: 'Patient.active',
              min: 0,
              max: '1',
              type: [{ code: 'boolean' }]
            }
          ]
        }
      };

      validationService.registerStructureDefinition(structureDefinition);
    });

    it('should validate valid resource', () => {
      const patient = {
        resourceType: 'Patient',
        name: 'John Doe',
        active: true
      };

      const result = validationService.validate(patient, 'http://example.org/StructureDefinition/Patient');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required elements', () => {
      const patient = {
        resourceType: 'Patient',
        active: true
        // Missing required 'name' field
      };

      const result = validationService.validate(patient, 'http://example.org/StructureDefinition/Patient');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Required element');
      expect(result.errors[0].path).toBe('Patient.name');
    });

    it('should detect wrong resource type', () => {
      const observation = {
        resourceType: 'Observation',
        name: 'Test'
      };

      const result = validationService.validate(observation, 'http://example.org/StructureDefinition/Patient');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Expected resourceType');
    });

    it('should return error for unknown StructureDefinition', () => {
      const resource = {
        resourceType: 'Unknown'
      };

      const result = validationService.validate(resource, 'http://example.org/unknown');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('StructureDefinition not found');
    });

    it('should generate warnings for type mismatches', () => {
      const patient = {
        resourceType: 'Patient',
        name: 'John Doe',
        active: 'true' // String instead of boolean
      };

      const result = validationService.validate(patient, 'http://example.org/StructureDefinition/Patient');
      
      expect(result.valid).toBe(true); // No errors, just warnings
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('may not match expected type');
      expect(result.warnings[0].path).toBe('Patient.active');
    });
  });

  describe('clearStructureDefinitions', () => {
    it('should clear all registered StructureDefinitions', () => {
      const structureDefinition: StructureDefinition = {
        resourceType: 'StructureDefinition',
        name: 'Test',
        status: 'active',
        kind: 'logical',
        type: 'Test'
      };

      validationService.registerStructureDefinition(structureDefinition);
      expect(validationService.getStructureDefinitions()).toHaveLength(1);

      validationService.clearStructureDefinitions();
      expect(validationService.getStructureDefinitions()).toHaveLength(0);
    });
  });
});