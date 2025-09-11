#!/usr/bin/env node

import { FmlRunnerApi } from './api/server';
import { FmlRunner } from './index';

/**
 * Parse command line arguments
 */
function parseArgs(): { port: number; baseUrl: string } {
  const args = process.argv.slice(2);
  let port = parseInt(process.env.PORT || '3000', 10);
  let baseUrl = process.env.BASE_URL || './maps';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--port' || arg === '-p') {
      const portValue = args[i + 1];
      if (portValue) {
        const parsedPort = parseInt(portValue, 10);
        if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
          port = parsedPort;
          i++; // Skip the next argument as it's the port value
        } else {
          console.error(`Invalid port value: ${portValue}`);
          process.exit(1);
        }
      }
    } else if (arg === '--base-url' || arg === '-b') {
      const baseUrlValue = args[i + 1];
      if (baseUrlValue) {
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