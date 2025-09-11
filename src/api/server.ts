import express, { Request, Response } from 'express';
import cors from 'cors';
import { FmlRunner } from '../index';

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
    const apiRouter = express.Router();

    // Legacy endpoints for backward compatibility
    apiRouter.post('/compile', this.compileFml.bind(this));
    apiRouter.post('/execute', this.executeStructureMap.bind(this));
    apiRouter.get('/structuremap/:reference', this.getStructureMap.bind(this));

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
      
      // Use existing retrieval logic with ID as reference
      const structureMap = await this.fmlRunner.getStructureMap(id);
      
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
      version: '0.1.0'
    });
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