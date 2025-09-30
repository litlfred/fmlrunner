#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = 'packages';
const ROOT_PACKAGE = 'package.json';

function getPackages() {
  const packagesDir = path.join(__dirname, '..', PACKAGES_DIR);
  if (!fs.existsSync(packagesDir)) {
    console.log('No packages directory found');
    return [];
  }
  
  return fs.readdirSync(packagesDir)
    .filter(name => {
      const packageJsonPath = path.join(packagesDir, name, 'package.json');
      return fs.existsSync(packageJsonPath);
    })
    .map(name => ({
      name,
      path: path.join(packagesDir, name),
      packageJsonPath: path.join(packagesDir, name, 'package.json')
    }));
}

function getCurrentVersion() {
  const rootPackageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGE, 'utf8'));
  return rootPackageJson.version;
}

function updateVersion(newVersion) {
  // Update root package.json
  const rootPackageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGE, 'utf8'));
  rootPackageJson.version = newVersion;
  fs.writeFileSync(ROOT_PACKAGE, JSON.stringify(rootPackageJson, null, 2) + '\n');
  
  // Update all package.json files
  const packages = getPackages();
  packages.forEach(pkg => {
    const packageJson = JSON.parse(fs.readFileSync(pkg.packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(pkg.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated ${pkg.name} to version ${newVersion}`);
  });
}

function bumpVersion(type = 'patch') {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  updateVersion(newVersion);
  console.log(`Bumped version from ${currentVersion} to ${newVersion}`);
  return newVersion;
}

function publishPackages(dryRun = false) {
  const packages = getPackages();
  
  if (packages.length === 0) {
    console.log('No packages found to publish');
    return;
  }
  
  const { execSync } = require('child_process');
  
  // Publish in dependency order: fmlrunner first, then others
  const publishOrder = ['fmlrunner', ...packages.map(p => p.name).filter(n => n !== 'fmlrunner')];
  
  publishOrder.forEach(packageName => {
    const pkg = packages.find(p => p.name === packageName);
    if (!pkg) return;
    
    console.log(`${dryRun ? '[DRY RUN] ' : ''}Publishing ${pkg.name}...`);
    
    try {
      const publishCmd = `npm publish${dryRun ? ' --dry-run' : ''}`;
      execSync(publishCmd, { 
        cwd: pkg.path, 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log(`${dryRun ? '[DRY RUN] ' : ''}Successfully published ${pkg.name}`);
    } catch (error) {
      console.error(`Failed to publish ${pkg.name}:`, error.message);
      throw error;
    }
  });
}

// Command line interface
const [,, command, ...args] = process.argv;

switch (command) {
  case 'current':
    console.log(getCurrentVersion());
    break;
    
  case 'bump':
    bumpVersion(args[0] || 'patch');
    break;
    
  case 'set':
    if (!args[0]) {
      console.error('Please provide a version number');
      process.exit(1);
    }
    updateVersion(args[0]);
    console.log(`Set version to ${args[0]}`);
    break;
    
  case 'publish':
    const dryRun = args.includes('--dry-run');
    publishPackages(dryRun);
    break;
    
  default:
    console.log(`
Usage: node scripts/version.js <command>

Commands:
  current                 Show current version
  bump [major|minor|patch] Bump version (default: patch)
  set <version>          Set specific version
  publish [--dry-run]    Publish packages to npm
`);
    break;
}