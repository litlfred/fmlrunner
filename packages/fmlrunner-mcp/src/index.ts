import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolRequest,
  CallToolResult,
  TextContent,
  ImageContent,
  EmbeddedResource
} from '@modelcontextprotocol/sdk/types.js';
import { FmlRunner } from 'fmlrunner';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import winston from 'winston';

/**
 * MCP interface for FML Runner with JSON schema-defined endpoints
 */
export class FmlRunnerMcp {
  private server: Server;
  private fmlRunner: FmlRunner;
  private ajv: Ajv;
  private logger: winston.Logger;

  constructor(options?: { logLevel?: string; baseUrl?: string }) {
    this.logger = winston.createLogger({
      level: options?.logLevel || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    this.fmlRunner = new FmlRunner({
      baseUrl: options?.baseUrl,
      logLevel: options?.logLevel as any,
      validateInputOutput: true
    });

    this.ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(this.ajv);

    this.server = new Server(
      {
        name: 'fmlrunner-mcp',
        version: '0.1.0',
        description: 'FHIR Mapping Language (FML) Runner MCP interface for compiling and executing StructureMaps'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupSchemas();
    this.setupTools();
  }

  private setupSchemas(): void {
    // FML Compilation Input Schema
    const fmlCompilationInputSchema = {
      type: 'object',
      properties: {
        fmlContent: {
          type: 'string',
          minLength: 1,
          pattern: '^map\\s+',
          description: 'FHIR Mapping Language (FML) content starting with map declaration'
        }
      },
      required: ['fmlContent'],
      additionalProperties: false
    };
    this.ajv.addSchema(fmlCompilationInputSchema, 'fml-compilation-input');

    // StructureMap Execution Input Schema
    const structureMapExecutionInputSchema = {
      type: 'object',
      properties: {
        structureMapReference: {
          type: 'string',
          minLength: 1,
          description: 'Reference to StructureMap (ID or URL)'
        },
        inputContent: {
          description: 'Input data to transform (any valid JSON)',
          oneOf: [
            { type: 'object' },
            { type: 'array' },
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' }
          ]
        },
        options: {
          type: 'object',
          properties: {
            strictMode: {
              type: 'boolean',
              description: 'Enable strict validation mode'
            },
            validateInputOutput: {
              type: 'boolean',
              description: 'Enable input/output validation'
            }
          },
          additionalProperties: false
        }
      },
      required: ['structureMapReference', 'inputContent'],
      additionalProperties: false
    };
    this.ajv.addSchema(structureMapExecutionInputSchema, 'structuremap-execution-input');

    // Bundle Processing Input Schema
    const bundleProcessingInputSchema = {
      type: 'object',
      properties: {
        bundle: {
          type: 'object',
          properties: {
            resourceType: { type: 'string', const: 'Bundle' },
            entry: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  resource: { type: 'object' }
                },
                required: ['resource']
              }
            }
          },
          required: ['resourceType'],
          additionalProperties: true
        }
      },
      required: ['bundle'],
      additionalProperties: false
    };
    this.ajv.addSchema(bundleProcessingInputSchema, 'bundle-processing-input');

    // Resource Management Input Schema
    const resourceManagementInputSchema = {
      type: 'object',
      properties: {
        resource: {
          type: 'object',
          description: 'FHIR resource (StructureMap, ConceptMap, ValueSet, CodeSystem, StructureDefinition)'
        },
        resourceType: {
          type: 'string',
          enum: ['StructureMap', 'ConceptMap', 'ValueSet', 'CodeSystem', 'StructureDefinition'],
          description: 'Type of FHIR resource'
        },
        reference: {
          type: 'string',
          description: 'Resource reference (ID or URL) for retrieval/deletion operations'
        }
      },
      additionalProperties: false
    };
    this.ajv.addSchema(resourceManagementInputSchema, 'resource-management-input');
  }

  private setupTools(): void {
    // FML Compilation Tool
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'compile-fml',
            description: 'Compile FHIR Mapping Language (FML) content into a StructureMap resource',
            inputSchema: {
              type: 'object',
              properties: {
                fmlContent: {
                  type: 'string',
                  description: 'FML content to compile (must start with map declaration)'
                }
              },
              required: ['fmlContent']
            }
          },
          {
            name: 'execute-structuremap',
            description: 'Execute a StructureMap transformation on input data',
            inputSchema: {
              type: 'object',
              properties: {
                structureMapReference: {
                  type: 'string',
                  description: 'StructureMap reference (ID or URL)'
                },
                inputContent: {
                  description: 'Input data to transform'
                },
                options: {
                  type: 'object',
                  properties: {
                    strictMode: { type: 'boolean' },
                    validateInputOutput: { type: 'boolean' }
                  }
                }
              },
              required: ['structureMapReference', 'inputContent']
            }
          },
          {
            name: 'process-bundle',
            description: 'Process a FHIR Bundle containing multiple resources (StructureMaps, ConceptMaps, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                bundle: {
                  type: 'object',
                  description: 'FHIR Bundle resource with entries'
                }
              },
              required: ['bundle']
            }
          },
          {
            name: 'register-resource',
            description: 'Register a FHIR resource (StructureMap, ConceptMap, ValueSet, CodeSystem, StructureDefinition)',
            inputSchema: {
              type: 'object',
              properties: {
                resource: {
                  type: 'object',
                  description: 'FHIR resource to register'
                },
                resourceType: {
                  type: 'string',
                  enum: ['StructureMap', 'ConceptMap', 'ValueSet', 'CodeSystem', 'StructureDefinition']
                }
              },
              required: ['resource', 'resourceType']
            }
          },
          {
            name: 'get-resource',
            description: 'Retrieve a registered FHIR resource by reference',
            inputSchema: {
              type: 'object',
              properties: {
                reference: {
                  type: 'string',
                  description: 'Resource reference (ID or URL)'
                },
                resourceType: {
                  type: 'string',
                  enum: ['StructureMap', 'ConceptMap', 'ValueSet', 'CodeSystem', 'StructureDefinition']
                }
              },
              required: ['reference', 'resourceType']
            }
          },
          {
            name: 'list-resources',
            description: 'List all registered resources of a specific type',
            inputSchema: {
              type: 'object',
              properties: {
                resourceType: {
                  type: 'string',
                  enum: ['StructureMap', 'ConceptMap', 'ValueSet', 'CodeSystem', 'StructureDefinition']
                },
                searchParams: {
                  type: 'object',
                  description: 'Optional search parameters (name, status, url, etc.)'
                }
              },
              required: ['resourceType']
            }
          },
          {
            name: 'translate-code',
            description: 'Translate a code using registered ConceptMaps',
            inputSchema: {
              type: 'object',
              properties: {
                sourceSystem: { type: 'string' },
                sourceCode: { type: 'string' },
                targetSystem: { type: 'string' }
              },
              required: ['sourceSystem', 'sourceCode']
            }
          },
          {
            name: 'validate-code',
            description: 'Validate a code against a ValueSet or CodeSystem',
            inputSchema: {
              type: 'object',
              properties: {
                valueSetRef: { type: 'string' },
                system: { type: 'string' },
                code: { type: 'string' },
                display: { type: 'string' }
              },
              required: ['valueSetRef', 'code']
            }
          }
        ]
      };
    });

    // Tool Call Handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        this.logger.info(`Executing MCP tool: ${name}`, { args });

        switch (name) {
          case 'compile-fml':
            return await this.handleCompileFml(args);
          
          case 'execute-structuremap':
            return await this.handleExecuteStructureMap(args);
          
          case 'process-bundle':
            return await this.handleProcessBundle(args);
          
          case 'register-resource':
            return await this.handleRegisterResource(args);
          
          case 'get-resource':
            return await this.handleGetResource(args);
          
          case 'list-resources':
            return await this.handleListResources(args);
          
          case 'translate-code':
            return await this.handleTranslateCode(args);
          
          case 'validate-code':
            return await this.handleValidateCode(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        this.logger.error(`MCP tool execution failed: ${name}`, { error: error instanceof Error ? error.message : error });
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private async handleCompileFml(args: any): Promise<CallToolResult> {
    // Validate input
    const validate = this.ajv.getSchema('fml-compilation-input');
    if (!validate || !validate(args)) {
      throw new Error(`Invalid input: ${validate?.errors?.map(e => e.message).join(', ')}`);
    }

    const result = this.fmlRunner.compileFml(args.fmlContent);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: result.success,
            structureMap: result.structureMap,
            errors: result.errors
          }, null, 2)
        }
      ]
    };
  }

  private async handleExecuteStructureMap(args: any): Promise<CallToolResult> {
    // Validate input
    const validate = this.ajv.getSchema('structuremap-execution-input');
    if (!validate || !validate(args)) {
      throw new Error(`Invalid input: ${validate?.errors?.map(e => e.message).join(', ')}`);
    }

    const result = await this.fmlRunner.executeStructureMapWithValidation(
      args.structureMapReference,
      args.inputContent,
      args.options
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: result.success,
            output: result.output,
            errors: result.errors,
            warnings: result.warnings
          }, null, 2)
        }
      ]
    };
  }

  private async handleProcessBundle(args: any): Promise<CallToolResult> {
    // Validate input
    const validate = this.ajv.getSchema('bundle-processing-input');
    if (!validate || !validate(args)) {
      throw new Error(`Invalid input: ${validate?.errors?.map(e => e.message).join(', ')}`);
    }

    const result = this.fmlRunner.processBundle(args.bundle);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async handleRegisterResource(args: any): Promise<CallToolResult> {
    const { resource, resourceType } = args;

    switch (resourceType) {
      case 'StructureMap':
        this.fmlRunner.registerStructureMap(resource);
        break;
      case 'ConceptMap':
        this.fmlRunner.registerConceptMap(resource);
        break;
      case 'ValueSet':
        this.fmlRunner.registerValueSet(resource);
        break;
      case 'CodeSystem':
        this.fmlRunner.registerCodeSystem(resource);
        break;
      case 'StructureDefinition':
        this.fmlRunner.registerStructureDefinition(resource);
        break;
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `${resourceType} registered successfully`,
            resourceId: resource.id
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetResource(args: any): Promise<CallToolResult> {
    const { reference, resourceType } = args;
    let resource;

    switch (resourceType) {
      case 'StructureMap':
        resource = await this.fmlRunner.getStructureMap(reference);
        break;
      case 'ConceptMap':
        resource = this.fmlRunner.getConceptMap(reference);
        break;
      case 'ValueSet':
        resource = this.fmlRunner.getValueSet(reference);
        break;
      case 'CodeSystem':
        resource = this.fmlRunner.getCodeSystem(reference);
        break;
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            found: !!resource,
            resource: resource || null
          }, null, 2)
        }
      ]
    };
  }

  private async handleListResources(args: any): Promise<CallToolResult> {
    const { resourceType, searchParams = {} } = args;
    let resources;

    switch (resourceType) {
      case 'StructureMap':
        resources = this.fmlRunner.searchStructureMaps(searchParams);
        break;
      case 'ConceptMap':
        resources = this.fmlRunner.searchConceptMaps(searchParams);
        break;
      case 'ValueSet':
        resources = this.fmlRunner.searchValueSets(searchParams);
        break;
      case 'CodeSystem':
        resources = this.fmlRunner.searchCodeSystems(searchParams);
        break;
      default:
        throw new Error(`Unsupported resource type: ${resourceType}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            resourceType,
            count: resources.length,
            resources
          }, null, 2)
        }
      ]
    };
  }

  private async handleTranslateCode(args: any): Promise<CallToolResult> {
    const { sourceSystem, sourceCode, targetSystem } = args;
    
    const translations = this.fmlRunner.translateCode(sourceSystem, sourceCode, targetSystem);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            sourceSystem,
            sourceCode,
            targetSystem,
            translations
          }, null, 2)
        }
      ]
    };
  }

  private async handleValidateCode(args: any): Promise<CallToolResult> {
    const { valueSetRef, system, code, display } = args;
    
    const result = this.fmlRunner.validateCodeInValueSet(valueSetRef, system, code, display);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            valueSetRef,
            system,
            code,
            display,
            result: result.result,
            message: result.message
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info('FML Runner MCP server started');
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    await this.server.close();
    this.logger.info('FML Runner MCP server stopped');
  }
}

// Export for use as a library
export { FmlRunnerMcp };

// CLI entry point
if (require.main === module) {
  const mcp = new FmlRunnerMcp({
    logLevel: process.env.LOG_LEVEL || 'info',
    baseUrl: process.env.BASE_URL || './maps'
  });

  mcp.start().catch(error => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    await mcp.stop();
    process.exit(0);
  });
}