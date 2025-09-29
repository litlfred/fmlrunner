import express, { Request, Response } from 'express';
import cors from 'cors';
import { FmlRunner } from 'fmlrunner';

/**
 * FML Runner API Server implementing the OpenAPI specification
 */
export class FmlRunnerApi {
  private app: express.Application;
  private fmlRunner: FmlRunner;

  constructor(fmlRunner?: FmlRunner) {
    this.app = express();
    this.fmlRunner = fmlRunner || new FmlRunner();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Setup API routes according to OpenAPI specification
   */
  private setupRoutes(): void {
    const apiRouter = express.Router({ caseSensitive: true });

    // Legacy endpoints for backward compatibility 
    apiRouter.post('/compile', this.compileFml.bind(this));
    apiRouter.post('/execute', this.executeStructureMap.bind(this));
    apiRouter.get('/structuremap/:reference', this.getStructureMap.bind(this));

    // FHIR Bundle processing endpoint
    apiRouter.post('/Bundle', this.processBundle.bind(this));
    apiRouter.get('/Bundle/summary', this.getBundleSummary.bind(this));

    // FHIR-compliant ConceptMap CRUD endpoints
    apiRouter.get('/ConceptMap', this.searchConceptMaps.bind(this));
    apiRouter.get('/ConceptMap/:id', this.getConceptMapById.bind(this));
    apiRouter.post('/ConceptMap', this.createConceptMap.bind(this));
    apiRouter.put('/ConceptMap/:id', this.updateConceptMap.bind(this));
    apiRouter.delete('/ConceptMap/:id', this.deleteConceptMap.bind(this));
    apiRouter.post('/ConceptMap/\\$translate', this.translateOperation.bind(this));

    // FHIR-compliant ValueSet CRUD endpoints
    apiRouter.get('/ValueSet', this.searchValueSets.bind(this));
    apiRouter.get('/ValueSet/:id', this.getValueSetById.bind(this));
    apiRouter.post('/ValueSet', this.createValueSet.bind(this));
    apiRouter.put('/ValueSet/:id', this.updateValueSet.bind(this));
    apiRouter.delete('/ValueSet/:id', this.deleteValueSet.bind(this));
    apiRouter.post('/ValueSet/:id/\\$expand', this.expandValueSetOperation.bind(this));
    apiRouter.post('/ValueSet/:id/\\$validate-code', this.validateCodeOperation.bind(this));

    // FHIR-compliant CodeSystem CRUD endpoints
    apiRouter.get('/CodeSystem', this.searchCodeSystems.bind(this));
    apiRouter.get('/CodeSystem/:id', this.getCodeSystemById.bind(this));
    apiRouter.post('/CodeSystem', this.createCodeSystem.bind(this));
    apiRouter.put('/CodeSystem/:id', this.updateCodeSystem.bind(this));
    apiRouter.delete('/CodeSystem/:id', this.deleteCodeSystem.bind(this));
    apiRouter.post('/CodeSystem/:id/\\$lookup', this.lookupOperation.bind(this));
    apiRouter.post('/CodeSystem/:id/\\$subsumes', this.subsumesOperation.bind(this));
    apiRouter.post('/CodeSystem/:id/\\$validate-code', this.validateCodeInCodeSystemOperation.bind(this));

    // FHIR-compliant StructureDefinition CRUD endpoints
    apiRouter.get('/StructureDefinition', this.searchStructureDefinitions.bind(this));
    apiRouter.get('/StructureDefinition/:id', this.getStructureDefinitionById.bind(this));
    apiRouter.post('/StructureDefinition', this.createStructureDefinition.bind(this));
    apiRouter.put('/StructureDefinition/:id', this.updateStructureDefinition.bind(this));
    apiRouter.delete('/StructureDefinition/:id', this.deleteStructureDefinition.bind(this));

    // FHIR $transform operation (need to register before :id route)
    apiRouter.post('/StructureMap/:operation(\\$transform)', this.transformOperation.bind(this));

    // FHIR-compliant StructureMap CRUD endpoints
    apiRouter.get('/StructureMap', this.searchStructureMaps.bind(this));
    apiRouter.get('/StructureMap/:id', this.getStructureMapById.bind(this));
    apiRouter.post('/StructureMap', this.createStructureMap.bind(this));
    apiRouter.put('/StructureMap/:id', this.updateStructureMap.bind(this));
    apiRouter.delete('/StructureMap/:id', this.deleteStructureMap.bind(this));

    // Enhanced execution with validation
    apiRouter.post('/execute-with-validation', this.executeWithValidation.bind(this));

    // Validation endpoint
    apiRouter.post('/validate', this.validateResource.bind(this));

    // Health check endpoint
    apiRouter.get('/health', this.healthCheck.bind(this));

    this.app.use('/api/v1', apiRouter);
  }

  /**
   * Compile FML content to StructureMap
   */
  private async compileFml(req: Request, res: Response): Promise<void> {
    try {
      const { fmlContent } = req.body;

      if (!fmlContent) {
        res.status(400).json({
          error: 'fmlContent is required',
          details: 'Request body must include fmlContent property'
        });
        return;
      }

      const result = this.fmlRunner.compileFml(fmlContent);

      if (result.success) {
        res.json(result.structureMap);
      } else {
        res.status(400).json({
          error: 'FML compilation failed',
          details: result.errors?.join(', ')
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute StructureMap transformation
   */
  private async executeStructureMap(req: Request, res: Response): Promise<void> {
    try {
      const { structureMapReference, inputContent } = req.body;

      if (!structureMapReference || !inputContent) {
        res.status(400).json({
          error: 'structureMapReference and inputContent are required',
          details: 'Request body must include both structureMapReference and inputContent properties'
        });
        return;
      }

      const result = await this.fmlRunner.executeStructureMap(structureMapReference, inputContent);

      if (result.success) {
        res.json({ result: result.result });
      } else {
        res.status(400).json({
          error: 'StructureMap execution failed',
          details: result.errors?.join(', ')
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Retrieve StructureMap by reference
   */
  private async getStructureMap(req: Request, res: Response): Promise<void> {
    try {
      const { reference } = req.params;

      if (!reference) {
        res.status(400).json({
          error: 'Reference parameter is required'
        });
        return;
      }

      const structureMap = await this.fmlRunner.getStructureMap(reference);

      if (structureMap) {
        res.json(structureMap);
      } else {
        res.status(404).json({
          error: 'StructureMap not found',
          details: `No StructureMap found for reference: ${reference}`
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search StructureMaps with FHIR search parameters
   */
  private async searchStructureMaps(req: Request, res: Response): Promise<void> {
    try {
      // FHIR search parameters - basic implementation
      const { name, status, url, _count = '20', _offset = '0' } = req.query;
      
      // For now, return empty bundle - would need database/storage implementation
      const bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 0,
        entry: []
      };

      res.json(bundle);
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get StructureMap by ID (FHIR-compliant)
   */
  private async getStructureMapById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // First check registered StructureMaps in memory
      const registeredMaps = this.fmlRunner.getAllStructureMaps();
      let structureMap: any = registeredMaps.find(sm => sm.id === id || sm.url === id);
      
      // If not found in memory, try file system
      if (!structureMap) {
        const retrieved = await this.fmlRunner.getStructureMap(id);
        structureMap = retrieved || null;
      }
      
      if (structureMap) {
        res.json(structureMap);
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `StructureMap with id '${id}' not found`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Create new StructureMap (FHIR-compliant)
   */
  private async createStructureMap(req: Request, res: Response): Promise<void> {
    try {
      const structureMap = req.body;
      
      // Basic validation
      if (!structureMap || structureMap.resourceType !== 'StructureMap') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid StructureMap resource'
          }]
        });
        return;
      }

      // Assign ID if not present
      if (!structureMap.id) {
        structureMap.id = 'sm-' + Date.now();
      }

      // TODO: Store the StructureMap (would need storage implementation)
      
      res.status(201).json(structureMap);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Update StructureMap (FHIR-compliant)
   */
  private async updateStructureMap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const structureMap = req.body;
      
      // Basic validation
      if (!structureMap || structureMap.resourceType !== 'StructureMap') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid StructureMap resource'
          }]
        });
        return;
      }

      // Ensure ID matches
      structureMap.id = id;

      // TODO: Store the StructureMap (would need storage implementation)
      
      res.json(structureMap);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Delete StructureMap (FHIR-compliant)
   */
  private async deleteStructureMap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // TODO: Delete the StructureMap (would need storage implementation)
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * FHIR $transform operation
   */
  private async transformOperation(req: Request, res: Response): Promise<void> {
    try {
      const parameters = req.body;
      
      // Validate Parameters resource
      if (!parameters || parameters.resourceType !== 'Parameters') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a FHIR Parameters resource'
          }]
        });
        return;
      }

      // Extract source data and StructureMap URL from parameters
      let sourceData = null;
      let structureMapUrl = null;

      if (parameters.parameter) {
        for (const param of parameters.parameter) {
          if (param.name === 'source') {
            sourceData = param.resource || param.valueString;
          } else if (param.name === 'map') {
            structureMapUrl = param.valueUri || param.valueString;
          }
        }
      }

      if (!sourceData || !structureMapUrl) {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Parameters must include both "source" and "map" parameters'
          }]
        });
        return;
      }

      // Execute transformation using existing logic
      const result = await this.fmlRunner.executeStructureMap(structureMapUrl, sourceData);

      if (result.success) {
        // Return result as Parameters resource
        const resultParameters = {
          resourceType: 'Parameters',
          parameter: [{
            name: 'result',
            resource: result.result
          }]
        };
        res.json(resultParameters);
      } else {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'processing',
            diagnostics: result.errors?.join(', ') || 'Transformation failed'
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Search StructureDefinitions with FHIR search parameters
   */
  private async searchStructureDefinitions(req: Request, res: Response): Promise<void> {
    try {
      // FHIR search parameters - basic implementation
      const { name, status, kind, type, _count = '20', _offset = '0' } = req.query;
      
      // Get registered StructureDefinitions from validation service
      const validationService = this.fmlRunner.getValidationService();
      const structureDefinitions = validationService ? validationService.getStructureDefinitions() : [];

      // Filter based on search parameters (basic implementation)
      let filteredDefinitions = structureDefinitions;
      
      if (name) {
        filteredDefinitions = filteredDefinitions.filter(sd => 
          sd.name?.toLowerCase().includes((name as string).toLowerCase())
        );
      }
      
      if (status) {
        filteredDefinitions = filteredDefinitions.filter(sd => sd.status === status);
      }

      const bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: filteredDefinitions.length,
        entry: filteredDefinitions.map(sd => ({
          resource: sd
        }))
      };

      res.json(bundle);
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get StructureDefinition by ID
   */
  private async getStructureDefinitionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // This would need a proper storage implementation
      res.status(404).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'not-found',
          diagnostics: `StructureDefinition with id '${id}' not found`
        }]
      });
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Create new StructureDefinition
   */
  private async createStructureDefinition(req: Request, res: Response): Promise<void> {
    try {
      const structureDefinition = req.body;
      
      // Basic validation
      if (!structureDefinition || structureDefinition.resourceType !== 'StructureDefinition') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid StructureDefinition resource'
          }]
        });
        return;
      }

      // Assign ID if not present
      if (!structureDefinition.id) {
        structureDefinition.id = 'sd-' + Date.now();
      }

      // Register with validation service
      const validationService = this.fmlRunner.getValidationService();
      if (validationService) {
        validationService.registerStructureDefinition(structureDefinition);
      }

      res.status(201).json(structureDefinition);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Update StructureDefinition
   */
  private async updateStructureDefinition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const structureDefinition = req.body;
      
      // Basic validation
      if (!structureDefinition || structureDefinition.resourceType !== 'StructureDefinition') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid StructureDefinition resource'
          }]
        });
        return;
      }

      // Ensure ID matches
      structureDefinition.id = id;

      // Register with validation service
      const validationService = this.fmlRunner.getValidationService();
      if (validationService) {
        validationService.registerStructureDefinition(structureDefinition);
      }

      res.json(structureDefinition);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Delete StructureDefinition
   */
  private async deleteStructureDefinition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // TODO: Remove from validation service
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Execute StructureMap with validation
   */
  private async executeWithValidation(req: Request, res: Response): Promise<void> {
    try {
      const { structureMapReference, inputContent, options } = req.body;

      if (!structureMapReference || !inputContent) {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'structureMapReference and inputContent are required'
          }]
        });
        return;
      }

      const result = await this.fmlRunner.executeStructureMapWithValidation(
        structureMapReference, 
        inputContent, 
        options
      );

      if (result.success) {
        res.json({ 
          result: result.result,
          validation: result.validation
        });
      } else {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'processing',
            diagnostics: result.errors?.join(', ') || 'Execution failed'
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Validate a resource against a StructureDefinition
   */
  private async validateResource(req: Request, res: Response): Promise<void> {
    try {
      const { resource, profile } = req.body;

      if (!resource || !profile) {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Both resource and profile are required'
          }]
        });
        return;
      }

      const validationService = this.fmlRunner.getValidationService();
      if (!validationService) {
        res.status(500).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-supported',
            diagnostics: 'Validation service not available'
          }]
        });
        return;
      }

      const validationResult = validationService.validate(resource, profile);

      const operationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          ...validationResult.errors.map(error => ({
            severity: 'error' as const,
            code: 'invariant' as const,
            diagnostics: error.message,
            location: [error.path]
          })),
          ...validationResult.warnings.map(warning => ({
            severity: 'warning' as const,
            code: 'informational' as const,
            diagnostics: warning.message,
            location: [warning.path]
          }))
        ]
      };

      if (validationResult.valid) {
        res.json(operationOutcome);
      } else {
        res.status(400).json(operationOutcome);
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Health check endpoint
   */
  private healthCheck(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      resources: this.fmlRunner.getBundleStats()
    });
  }

  // ============================================
  // BUNDLE PROCESSING ENDPOINTS
  // ============================================

  /**
   * Process FHIR Bundle and load resources
   */
  private async processBundle(req: Request, res: Response): Promise<void> {
    try {
      const bundle = req.body;
      
      if (!bundle || bundle.resourceType !== 'Bundle') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid Bundle resource'
          }]
        });
        return;
      }

      const result = this.fmlRunner.processBundle(bundle);
      
      if (result.success) {
        res.status(201).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'information',
            code: 'informational',
            diagnostics: `Successfully processed bundle. Loaded: ${result.processed.structureMaps} StructureMaps, ${result.processed.structureDefinitions} StructureDefinitions, ${result.processed.conceptMaps} ConceptMaps, ${result.processed.valueSets} ValueSets, ${result.processed.codeSystems} CodeSystems`
          }]
        });
      } else {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'processing',
            diagnostics: `Bundle processing failed: ${result.errors.join(', ')}`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Get bundle summary of loaded resources
   */
  private async getBundleSummary(req: Request, res: Response): Promise<void> {
    try {
      const summaryBundle = this.fmlRunner.createResourceSummaryBundle();
      res.json(summaryBundle);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  // ============================================
  // CONCEPTMAP CRUD ENDPOINTS
  // ============================================

  /**
   * Search ConceptMaps
   */
  private async searchConceptMaps(req: Request, res: Response): Promise<void> {
    try {
      const { name, status, url, source, target, _count = '20', _offset = '0' } = req.query;
      
      const conceptMaps = this.fmlRunner.searchConceptMaps({
        name: name as string,
        status: status as string,
        url: url as string,
        source: source as string,
        target: target as string
      });

      const bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: conceptMaps.length,
        entry: conceptMaps.map(cm => ({
          resource: cm
        }))
      };

      res.json(bundle);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Get ConceptMap by ID
   */
  private async getConceptMapById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const conceptMap = this.fmlRunner.getConceptMap(id);
      
      if (conceptMap) {
        res.json(conceptMap);
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `ConceptMap with id '${id}' not found`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Create ConceptMap
   */
  private async createConceptMap(req: Request, res: Response): Promise<void> {
    try {
      const conceptMap = req.body;
      
      if (!conceptMap || conceptMap.resourceType !== 'ConceptMap') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid ConceptMap resource'
          }]
        });
        return;
      }

      if (!conceptMap.id) {
        conceptMap.id = 'cm-' + Date.now();
      }

      this.fmlRunner.registerConceptMap(conceptMap);
      res.status(201).json(conceptMap);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Update ConceptMap
   */
  private async updateConceptMap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const conceptMap = req.body;
      
      if (!conceptMap || conceptMap.resourceType !== 'ConceptMap') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid ConceptMap resource'
          }]
        });
        return;
      }

      conceptMap.id = id;
      this.fmlRunner.registerConceptMap(conceptMap);
      res.json(conceptMap);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Delete ConceptMap
   */
  private async deleteConceptMap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = this.fmlRunner.removeConceptMap(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `ConceptMap with id '${id}' not found`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * ConceptMap $translate operation
   */
  private async translateOperation(req: Request, res: Response): Promise<void> {
    try {
      const parameters = req.body;
      
      if (!parameters || parameters.resourceType !== 'Parameters') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a FHIR Parameters resource'
          }]
        });
        return;
      }

      let system: string | undefined;
      let code: string | undefined;
      let target: string | undefined;

      if (parameters.parameter) {
        for (const param of parameters.parameter) {
          if (param.name === 'system') {
            system = param.valueUri || param.valueString;
          } else if (param.name === 'code') {
            code = param.valueCode || param.valueString;
          } else if (param.name === 'target') {
            target = param.valueUri || param.valueString;
          }
        }
      }

      if (!system || !code) {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Parameters must include both "system" and "code" parameters'
          }]
        });
        return;
      }

      const translations = this.fmlRunner.translateCode(system, code, target);
      
      const resultParameters = {
        resourceType: 'Parameters',
        parameter: translations.map(t => ({
          name: 'match',
          part: [
            { name: 'equivalence', valueCode: t.equivalence },
            ...(t.system ? [{ name: 'concept', valueCoding: { system: t.system, code: t.code, display: t.display } }] : [])
          ]
        }))
      };

      res.json(resultParameters);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  // ============================================
  // VALUESET CRUD ENDPOINTS
  // ============================================

  /**
   * Search ValueSets
   */
  private async searchValueSets(req: Request, res: Response): Promise<void> {
    try {
      const { name, status, url, publisher, jurisdiction, _count = '20', _offset = '0' } = req.query;
      
      const valueSets = this.fmlRunner.searchValueSets({
        name: name as string,
        status: status as string,
        url: url as string,
        publisher: publisher as string,
        jurisdiction: jurisdiction as string
      });

      const bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: valueSets.length,
        entry: valueSets.map(vs => ({
          resource: vs
        }))
      };

      res.json(bundle);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Get ValueSet by ID
   */
  private async getValueSetById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const valueSet = this.fmlRunner.getValueSet(id);
      
      if (valueSet) {
        res.json(valueSet);
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `ValueSet with id '${id}' not found`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Create ValueSet
   */
  private async createValueSet(req: Request, res: Response): Promise<void> {
    try {
      const valueSet = req.body;
      
      if (!valueSet || valueSet.resourceType !== 'ValueSet') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid ValueSet resource'
          }]
        });
        return;
      }

      if (!valueSet.id) {
        valueSet.id = 'vs-' + Date.now();
      }

      this.fmlRunner.registerValueSet(valueSet);
      res.status(201).json(valueSet);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Update ValueSet
   */
  private async updateValueSet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const valueSet = req.body;
      
      if (!valueSet || valueSet.resourceType !== 'ValueSet') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid ValueSet resource'
          }]
        });
        return;
      }

      valueSet.id = id;
      this.fmlRunner.registerValueSet(valueSet);
      res.json(valueSet);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Delete ValueSet
   */
  private async deleteValueSet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = this.fmlRunner.removeValueSet(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `ValueSet with id '${id}' not found`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * ValueSet $expand operation
   */
  private async expandValueSetOperation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parameters = req.body;
      
      let count: number | undefined;
      let offset: number | undefined;

      if (parameters?.parameter) {
        for (const param of parameters.parameter) {
          if (param.name === 'count') {
            count = param.valueInteger;
          } else if (param.name === 'offset') {
            offset = param.valueInteger;
          }
        }
      }

      const expandedValueSet = this.fmlRunner.expandValueSet(id, count, offset);
      
      if (expandedValueSet) {
        res.json(expandedValueSet);
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `ValueSet with id '${id}' not found`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * ValueSet $validate-code operation
   */
  private async validateCodeOperation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parameters = req.body;
      
      let system: string | undefined;
      let code: string | undefined;
      let display: string | undefined;

      if (parameters?.parameter) {
        for (const param of parameters.parameter) {
          if (param.name === 'system') {
            system = param.valueUri || param.valueString;
          } else if (param.name === 'code') {
            code = param.valueCode || param.valueString;
          } else if (param.name === 'display') {
            display = param.valueString;
          }
        }
      }

      const validation = this.fmlRunner.validateCodeInValueSet(id, system, code, display);
      
      const resultParameters = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'result', valueBoolean: validation.result },
          ...(validation.message ? [{ name: 'message', valueString: validation.message }] : [])
        ]
      };

      res.json(resultParameters);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  // ============================================
  // CODESYSTEM CRUD ENDPOINTS
  // ============================================

  /**
   * Search CodeSystems
   */
  private async searchCodeSystems(req: Request, res: Response): Promise<void> {
    try {
      const { name, status, url, system, publisher, content, _count = '20', _offset = '0' } = req.query;
      
      const codeSystems = this.fmlRunner.searchCodeSystems({
        name: name as string,
        status: status as string,
        url: url as string,
        system: system as string,
        publisher: publisher as string,
        content: content as string
      });

      const bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: codeSystems.length,
        entry: codeSystems.map(cs => ({
          resource: cs
        }))
      };

      res.json(bundle);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Get CodeSystem by ID
   */
  private async getCodeSystemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const codeSystem = this.fmlRunner.getCodeSystem(id);
      
      if (codeSystem) {
        res.json(codeSystem);
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `CodeSystem with id '${id}' not found`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Create CodeSystem
   */
  private async createCodeSystem(req: Request, res: Response): Promise<void> {
    try {
      const codeSystem = req.body;
      
      if (!codeSystem || codeSystem.resourceType !== 'CodeSystem') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid CodeSystem resource'
          }]
        });
        return;
      }

      if (!codeSystem.id) {
        codeSystem.id = 'cs-' + Date.now();
      }

      this.fmlRunner.registerCodeSystem(codeSystem);
      res.status(201).json(codeSystem);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Update CodeSystem
   */
  private async updateCodeSystem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const codeSystem = req.body;
      
      if (!codeSystem || codeSystem.resourceType !== 'CodeSystem') {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Request body must be a valid CodeSystem resource'
          }]
        });
        return;
      }

      codeSystem.id = id;
      this.fmlRunner.registerCodeSystem(codeSystem);
      res.json(codeSystem);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Delete CodeSystem
   */
  private async deleteCodeSystem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = this.fmlRunner.removeCodeSystem(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `CodeSystem with id '${id}' not found`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * CodeSystem $lookup operation
   */
  private async lookupOperation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parameters = req.body;
      
      let code: string | undefined;
      let property: string[] | undefined;

      if (parameters?.parameter) {
        for (const param of parameters.parameter) {
          if (param.name === 'code') {
            code = param.valueCode || param.valueString;
          } else if (param.name === 'property') {
            property = property || [];
            property.push(param.valueCode || param.valueString);
          }
        }
      }

      if (!code) {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Parameters must include "code" parameter'
          }]
        });
        return;
      }

      const lookup = this.fmlRunner.lookupConcept(id, code, property);
      
      if (lookup) {
        const resultParameters = {
          resourceType: 'Parameters',
          parameter: [
            { name: 'name', valueString: lookup.name },
            ...(lookup.display ? [{ name: 'display', valueString: lookup.display }] : []),
            ...(lookup.definition ? [{ name: 'definition', valueString: lookup.definition }] : []),
            ...(lookup.designation ? lookup.designation.map((d: any) => ({
              name: 'designation',
              part: [
                ...(d.language ? [{ name: 'language', valueCode: d.language }] : []),
                ...(d.use ? [{ name: 'use', valueCoding: d.use }] : []),
                { name: 'value', valueString: d.value }
              ]
            })) : []),
            ...(lookup.property ? lookup.property.map((p: any) => ({
              name: 'property',
              part: [
                { name: 'code', valueCode: p.code },
                ...(p.valueCode ? [{ name: 'value', valueCode: p.valueCode }] : []),
                ...(p.valueString ? [{ name: 'value', valueString: p.valueString }] : []),
                ...(p.valueInteger ? [{ name: 'value', valueInteger: p.valueInteger }] : []),
                ...(p.valueBoolean !== undefined ? [{ name: 'value', valueBoolean: p.valueBoolean }] : [])
              ]
            })) : [])
          ]
        };

        res.json(resultParameters);
      } else {
        res.status(404).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'not-found',
            diagnostics: `Code '${code}' not found in CodeSystem '${id}'`
          }]
        });
      }
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * CodeSystem $subsumes operation
   */
  private async subsumesOperation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parameters = req.body;
      
      let codeA: string | undefined;
      let codeB: string | undefined;

      if (parameters?.parameter) {
        for (const param of parameters.parameter) {
          if (param.name === 'codeA') {
            codeA = param.valueCode || param.valueString;
          } else if (param.name === 'codeB') {
            codeB = param.valueCode || param.valueString;
          }
        }
      }

      if (!codeA || !codeB) {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Parameters must include both "codeA" and "codeB" parameters'
          }]
        });
        return;
      }

      const result = this.fmlRunner.testSubsumption(id, codeA, codeB);
      
      const resultParameters = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'outcome', valueCode: result }
        ]
      };

      res.json(resultParameters);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * CodeSystem $validate-code operation
   */
  private async validateCodeInCodeSystemOperation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parameters = req.body;
      
      let code: string | undefined;
      let display: string | undefined;

      if (parameters?.parameter) {
        for (const param of parameters.parameter) {
          if (param.name === 'code') {
            code = param.valueCode || param.valueString;
          } else if (param.name === 'display') {
            display = param.valueString;
          }
        }
      }

      if (!code) {
        res.status(400).json({
          resourceType: 'OperationOutcome',
          issue: [{
            severity: 'error',
            code: 'invalid',
            diagnostics: 'Parameters must include "code" parameter'
          }]
        });
        return;
      }

      const validation = this.fmlRunner.validateCodeInCodeSystem(id, code, display);
      
      const resultParameters = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'result', valueBoolean: validation.result },
          ...(validation.display ? [{ name: 'display', valueString: validation.display }] : []),
          ...(validation.message ? [{ name: 'message', valueString: validation.message }] : [])
        ]
      };

      res.json(resultParameters);
    } catch (error) {
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'exception',
          diagnostics: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  /**
   * Get Express application instance
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Start the server
   */
  listen(port: number = 3000): void {
    this.app.listen(port, () => {
      console.log(`FML Runner API server listening on port ${port}`);
    });
  }
}