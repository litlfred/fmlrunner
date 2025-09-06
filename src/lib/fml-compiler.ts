import { StructureMap, FmlCompilationResult } from '../types';

/**
 * FML Compiler - converts FHIR Mapping Language to StructureMap
 */
export class FmlCompiler {
  
  /**
   * Compile FML content to a StructureMap
   * @param fmlContent The FML content to compile
   * @returns Compilation result with StructureMap or errors
   */
  compile(fmlContent: string): FmlCompilationResult {
    try {
      // Basic validation
      if (!fmlContent || fmlContent.trim().length === 0) {
        return {
          success: false,
          errors: ['FML content cannot be empty']
        };
      }

      // Parse basic FML structure
      const structureMap = this.parseFmlToStructureMap(fmlContent);
      
      return {
        success: true,
        structureMap
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown compilation error']
      };
    }
  }

  /**
   * Parse FML content to StructureMap (basic implementation)
   */
  private parseFmlToStructureMap(fmlContent: string): StructureMap {
    // This is a basic parser - a real implementation would need a proper FML grammar parser
    const lines = fmlContent.split('\n').map(line => line.trim()).filter(line => line);
    
    let mapName = 'DefaultMap';
    let url = '';
    
    // Extract map declaration
    for (const line of lines) {
      if (line.startsWith('map ')) {
        const match = line.match(/map\s+"([^"]+)"\s*=\s*"([^"]+)"/);
        if (match) {
          url = match[1];
          mapName = match[2];
        }
      }
    }

    // Create basic StructureMap structure
    const structureMap: StructureMap = {
      resourceType: 'StructureMap',
      url: url || `http://example.org/StructureMap/${mapName}`,
      name: mapName,
      status: 'draft',
      group: [{
        name: 'main',
        input: [
          {
            name: 'source',
            mode: 'source'
          },
          {
            name: 'target',
            mode: 'target'
          }
        ],
        rule: []
      }]
    };

    // Parse basic rules (simplified)
    for (const line of lines) {
      if (line.includes('->')) {
        const rule = this.parseRule(line);
        if (rule) {
          structureMap.group[0].rule.push(rule);
        }
      }
    }

    return structureMap;
  }

  /**
   * Parse a basic mapping rule
   */
  private parseRule(line: string): any {
    // Very basic rule parsing - real implementation would be much more sophisticated
    const parts = line.split('->').map(p => p.trim());
    if (parts.length === 2) {
      return {
        source: [{
          context: 'source',
          element: parts[0]
        }],
        target: [{
          context: 'target',
          element: parts[1]
        }]
      };
    }
    return null;
  }
}