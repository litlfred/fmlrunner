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

    // Compile FML to StructureMap
    apiRouter.post('/compile', this.compileFml.bind(this));

    // Execute StructureMap transformation
    apiRouter.post('/execute', this.executeStructureMap.bind(this));

    // Retrieve StructureMap by reference
    apiRouter.get('/structuremap/:reference', this.getStructureMap.bind(this));

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