#!/usr/bin/env node

import { FmlRunnerApi } from './api/server';
import { FmlRunner } from './index';

/**
 * Standalone server entry point
 */
function main() {
  const port = parseInt(process.env.PORT || '3000', 10);
  const baseUrl = process.env.BASE_URL || './maps';

  const fmlRunner = new FmlRunner({ baseUrl });
  const api = new FmlRunnerApi(fmlRunner);

  api.listen(port);
  console.log(`FML Runner API server started on port ${port}`);
  console.log(`Base directory for StructureMaps: ${baseUrl}`);
}

if (require.main === module) {
  main();
}