import { Bundle, BundleEntry, StructureMap, StructureDefinition, ConceptMap, ValueSet, CodeSystem } from '../types';
import { ConceptMapService } from './conceptmap-service';
import { ValueSetService } from './valueset-service';
import { CodeSystemService } from './codesystem-service';
import { ValidationService } from './validation-service';
import { Logger } from './logger';

/**
 * Result of processing a bundle
 */
export interface BundleProcessingResult {
  success: boolean;
  processed: {
    structureMaps: number;
    structureDefinitions: number;
    conceptMaps: number;
    valueSets: number;
    codeSystems: number;
    other: number;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Service for processing FHIR Bundles and distributing resources to appropriate services
 */
export class BundleService {
  private logger: Logger;
  
  constructor(
    private conceptMapService: ConceptMapService,
    private valueSetService: ValueSetService,
    private codeSystemService: CodeSystemService,
    private validationService: ValidationService | undefined,
    private structureMapStore: Map<string, StructureMap>,
    logger: Logger
  ) {
    this.logger = logger;
  }

  /**
   * Process a FHIR Bundle and register all contained resources
   */
  processBundle(bundle: Bundle): BundleProcessingResult {
    const result: BundleProcessingResult = {
      success: true,
      processed: {
        structureMaps: 0,
        structureDefinitions: 0,
        conceptMaps: 0,
        valueSets: 0,
        codeSystems: 0,
        other: 0
      },
      errors: [],
      warnings: []
    };

    if (!bundle.entry || bundle.entry.length === 0) {
      result.warnings.push('Bundle contains no entries');
      return result;
    }

    for (let i = 0; i < bundle.entry.length; i++) {
      const entry = bundle.entry[i];
      
      try {
        this.processEntry(entry, i, result);
      } catch (error) {
        const errorMsg = `Error processing entry ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        result.success = false;
      }
    }

    return result;
  }

  /**
   * Process a single bundle entry
   */
  private processEntry(entry: BundleEntry, index: number, result: BundleProcessingResult): void {
    if (!entry.resource) {
      result.warnings.push(`Entry ${index} has no resource`);
      return;
    }

    const resource = entry.resource;
    
    switch (resource.resourceType) {
      case 'StructureMap':
        this.processStructureMap(resource as StructureMap, index, result);
        break;
        
      case 'StructureDefinition':
        this.processStructureDefinition(resource as StructureDefinition, index, result);
        break;
        
      case 'ConceptMap':
        this.processConceptMap(resource as ConceptMap, index, result);
        break;
        
      case 'ValueSet':
        this.processValueSet(resource as ValueSet, index, result);
        break;
        
      case 'CodeSystem':
        this.processCodeSystem(resource as CodeSystem, index, result);
        break;
        
      default:
        result.processed.other++;
        result.warnings.push(`Entry ${index}: Unsupported resource type '${resource.resourceType}'`);
    }
  }

  /**
   * Process StructureMap resource
   */
  private processStructureMap(structureMap: StructureMap, index: number, result: BundleProcessingResult): void {
    try {
      if (!structureMap.id && !structureMap.url) {
        result.warnings.push(`Entry ${index}: StructureMap has no id or url, skipping`);
        return;
      }

      // Store in StructureMap store if available
      if (this.structureMapStore) {
        if (structureMap.id) {
          this.structureMapStore.set(structureMap.id, structureMap);
        }
        if (structureMap.url) {
          this.structureMapStore.set(structureMap.url, structureMap);
        }
      }

      result.processed.structureMaps++;
    } catch (error) {
      result.errors.push(`Entry ${index}: Failed to process StructureMap - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process StructureDefinition resource
   */
  private processStructureDefinition(structureDefinition: StructureDefinition, index: number, result: BundleProcessingResult): void {
    try {
      if (!structureDefinition.id && !structureDefinition.url) {
        result.warnings.push(`Entry ${index}: StructureDefinition has no id or url, skipping`);
        return;
      }

      // Register with validation service if available
      if (this.validationService) {
        this.validationService.registerStructureDefinition(structureDefinition);
      }

      result.processed.structureDefinitions++;
    } catch (error) {
      result.errors.push(`Entry ${index}: Failed to process StructureDefinition - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process ConceptMap resource
   */
  private processConceptMap(conceptMap: ConceptMap, index: number, result: BundleProcessingResult): void {
    try {
      if (!conceptMap.id && !conceptMap.url) {
        result.warnings.push(`Entry ${index}: ConceptMap has no id or url, skipping`);
        return;
      }

      this.conceptMapService.registerConceptMap(conceptMap);
      result.processed.conceptMaps++;
    } catch (error) {
      result.errors.push(`Entry ${index}: Failed to process ConceptMap - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process ValueSet resource
   */
  private processValueSet(valueSet: ValueSet, index: number, result: BundleProcessingResult): void {
    try {
      if (!valueSet.id && !valueSet.url) {
        result.warnings.push(`Entry ${index}: ValueSet has no id or url, skipping`);
        return;
      }

      this.valueSetService.registerValueSet(valueSet);
      result.processed.valueSets++;
    } catch (error) {
      result.errors.push(`Entry ${index}: Failed to process ValueSet - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process CodeSystem resource
   */
  private processCodeSystem(codeSystem: CodeSystem, index: number, result: BundleProcessingResult): void {
    try {
      if (!codeSystem.id && !codeSystem.url) {
        result.warnings.push(`Entry ${index}: CodeSystem has no id or url, skipping`);
        return;
      }

      this.codeSystemService.registerCodeSystem(codeSystem);
      result.processed.codeSystems++;
    } catch (error) {
      result.errors.push(`Entry ${index}: Failed to process CodeSystem - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a summary bundle of all loaded resources
   */
  createSummaryBundle(): Bundle {
    const entries: BundleEntry[] = [];
    
    // Add StructureMaps
    if (this.structureMapStore) {
      const uniqueStructureMaps = new Map<string, StructureMap>();
      this.structureMapStore.forEach((sm) => {
        const key = sm.id || sm.url || Math.random().toString();
        uniqueStructureMaps.set(key, sm);
      });
      
      uniqueStructureMaps.forEach((sm) => {
        entries.push({
          fullUrl: sm.url || `StructureMap/${sm.id}`,
          resource: sm
        });
      });
    }

    // Add StructureDefinitions
    if (this.validationService) {
      const structureDefinitions = this.validationService.getStructureDefinitions();
      structureDefinitions.forEach((sd) => {
        entries.push({
          fullUrl: sd.url || `StructureDefinition/${sd.id}`,
          resource: sd
        });
      });
    }

    // Add ConceptMaps
    this.conceptMapService.getAllConceptMaps().forEach((cm) => {
      entries.push({
        fullUrl: cm.url || `ConceptMap/${cm.id}`,
        resource: cm
      });
    });

    // Add ValueSets
    this.valueSetService.getAllValueSets().forEach((vs) => {
      entries.push({
        fullUrl: vs.url || `ValueSet/${vs.id}`,
        resource: vs
      });
    });

    // Add CodeSystems
    this.codeSystemService.getAllCodeSystems().forEach((cs) => {
      entries.push({
        fullUrl: cs.url || `CodeSystem/${cs.id}`,
        resource: cs
      });
    });

    return {
      resourceType: 'Bundle',
      id: 'loaded-resources-' + Date.now(),
      type: 'collection',
      timestamp: new Date().toISOString(),
      total: entries.length,
      entry: entries
    };
  }

  /**
   * Clear all loaded resources
   */
  clearAll(): void {
    this.conceptMapService.clear();
    this.valueSetService.clear();
    this.codeSystemService.clear();
    if (this.structureMapStore) {
      this.structureMapStore.clear();
    }
  }

  /**
   * Get loading statistics
   */
  getStats(): {
    structureMaps: number;
    structureDefinitions: number;
    conceptMaps: number;
    valueSets: number;
    codeSystems: number;
  } {
    return {
      structureMaps: this.structureMapStore ? Array.from(new Set(Array.from(this.structureMapStore.values()).map(sm => sm.id || sm.url))).length : 0,
      structureDefinitions: this.validationService ? this.validationService.getStructureDefinitions().length : 0,
      conceptMaps: this.conceptMapService.getCount(),
      valueSets: this.valueSetService.getCount(),
      codeSystems: this.codeSystemService.getCount()
    };
  }
}