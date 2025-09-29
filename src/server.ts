#!/usr/bin/env node

// MIGRATION NOTE: This server should be replaced with kotlin-fhir server implementation
// See: https://github.com/google/android-fhir
//
// TODO: Replace with Kotlin server (Ktor/Spring Boot)
// - Implement REST API using kotlin-fhir resources
// - Use kotlin-fhir validation and terminology services
// - Migrate to Kotlin multiplatform server implementation

console.warn('Legacy TypeScript server - migrate to kotlin-fhir server implementation');
console.error('Server migration required: Use kotlin-fhir with Ktor or Spring Boot instead');
process.exit(1);
        baseUrl = baseUrlValue;
        i++; // Skip the next argument as it's the base URL value
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
FML Runner API Server

Usage: node server.js [options]

Options:
  -p, --port <port>        Port to listen on (default: 3000, env: PORT)
  -b, --base-url <path>    Base directory for StructureMaps (default: ./maps, env: BASE_URL)
  -h, --help              Show this help message

Environment Variables:
  PORT                    Port to listen on
  BASE_URL               Base directory for StructureMaps
      `);
      process.exit(0);
    }
  }

  return { port, baseUrl };
}

/**
 * Standalone server entry point
 */
function main() {
  const { port, baseUrl } = parseArgs();

  const fmlRunner = new FmlRunner({ baseUrl });
  const api = new FmlRunnerApi(fmlRunner);

  api.listen(port);
  console.log(`FML Runner API server started on port ${port}`);
  console.log(`Base directory for StructureMaps: ${baseUrl}`);
}

if (require.main === module) {
  main();
}