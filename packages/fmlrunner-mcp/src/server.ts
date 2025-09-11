#!/usr/bin/env node

import { FmlRunnerMcp } from './index';

const mcp = new FmlRunnerMcp({
  logLevel: process.env.LOG_LEVEL || 'info',
  baseUrl: process.env.BASE_URL || './maps'
});

mcp.start().catch(error => {
  console.error('Failed to start FML Runner MCP server:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\nShutting down FML Runner MCP server...');
  await mcp.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down FML Runner MCP server...');
  await mcp.stop();
  process.exit(0);
});