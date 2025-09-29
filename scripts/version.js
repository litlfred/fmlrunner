#!/usr/bin/env node

/**
 * Versioning utility for FML Runner monorepo
 * Handles synchronized version updates across all packages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGES_DIR = path.join(__dirname, '..', 'packages');
const ROOT_PACKAGE = path.join(__dirname, '..', 'package.json');

function updatePackageVersion(packagePath, newVersion) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.version = newVersion;
  
  // Update fmlrunner dependency version in other packages
  if (packageJson.dependencies && packageJson.dependencies.fmlrunner) {
    packageJson.dependencies.fmlrunner = `^${newVersion}`;
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated ${path.basename(packagePath)} to version ${newVersion}`);
}

function prepareForPublishing(newVersion) {
  console.log('🔧 Preparing packages for publishing...');
  
  // Update all packages to use npm registry versions instead of file: paths
  const packages = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  packages.forEach(packageName => {
    if (packageName === 'fmlrunner') return; // Skip core package
    
    const packagePath = path.join(PACKAGES_DIR, packageName);
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Convert file: dependencies to npm registry versions
    if (packageJson.dependencies && packageJson.dependencies.fmlrunner && 
        packageJson.dependencies.fmlrunner.startsWith('file:')) {
      packageJson.dependencies.fmlrunner = `^${newVersion}`;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`🔄 Updated ${packageName} to use npm registry version`);
    }
  });
}

function restoreDevDependencies() {
  console.log('🔧 Restoring development dependencies...');
  
  const packages = ['fmlrunner-rest', 'fmlrunner-mcp', 'fmlrunner-web'];
  
  packages.forEach(packageName => {
    const packagePath = path.join(PACKAGES_DIR, packageName);
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Restore file: dependencies for development
    if (packageJson.dependencies && packageJson.dependencies.fmlrunner && 
        !packageJson.dependencies.fmlrunner.startsWith('file:')) {
      packageJson.dependencies.fmlrunner = 'file:../fmlrunner';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`🔄 Restored ${packageName} to use local file dependency`);
    }
  });
}

function getCurrentVersion() {
  const corePackage = path.join(PACKAGES_DIR, 'fmlrunner', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(corePackage, 'utf8'));
  return packageJson.version;
}

function incrementVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid version type: ${type}. Use 'major', 'minor', or 'patch'.`);
  }
}

function updateAllPackages(newVersion) {
  // Update root package.json
  const rootPackageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGE, 'utf8'));
  rootPackageJson.version = newVersion;
  fs.writeFileSync(ROOT_PACKAGE, JSON.stringify(rootPackageJson, null, 2) + '\n');
  console.log(`✅ Updated root package to version ${newVersion}`);
  
  // Update all packages
  const packages = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  packages.forEach(packageName => {
    const packagePath = path.join(PACKAGES_DIR, packageName);
    updatePackageVersion(packagePath, newVersion);
  });
}

function createTag(version) {
  try {
    execSync(`git tag v${version}`, { stdio: 'inherit' });
    console.log(`✅ Created git tag v${version}`);
  } catch (error) {
    console.error(`❌ Failed to create git tag: ${error.message}`);
  }
}

function publishPackages(dryRun = false) {
  const dryRunFlag = dryRun ? '--dry-run' : '';
  const version = getCurrentVersion();
  
  console.log(`${dryRun ? '🧪 Dry run:' : '📦'} Publishing packages...`);
  
  try {
    // Prepare for publishing (convert to npm registry dependencies)
    if (!dryRun) {
      prepareForPublishing(version);
    }
    
    // Publish core package first
    console.log('Publishing fmlrunner-kotlin-core...');
    execSync(`cd packages/fmlrunner-kotlin-core && npm publish --access public ${dryRunFlag}`, { stdio: 'inherit' });
    
    if (!dryRun) {
      console.log('⏳ Waiting for npm registry to update...');
      execSync('sleep 5');
    }
    
    // Publish core package
    console.log('Publishing fmlrunner core library...');
    execSync(`cd packages/fmlrunner && npm publish --access public ${dryRunFlag}`, { stdio: 'inherit' });
    
    if (!dryRun) {
      console.log('⏳ Waiting for npm registry to update...');
      execSync('sleep 10');
    }
    
    // Publish dependent packages
    const dependentPackages = ['fmlrunner-rest', 'fmlrunner-mcp', 'fmlrunner-web'];
    dependentPackages.forEach(packageName => {
      console.log(`Publishing ${packageName}...`);
      execSync(`cd packages/${packageName} && npm publish --access public ${dryRunFlag}`, { stdio: 'inherit' });
    });
    
    console.log(`✅ ${dryRun ? 'Dry run completed' : 'All packages published successfully'}!`);
    
    // Restore development dependencies
    if (!dryRun) {
      restoreDevDependencies();
    }
  } catch (error) {
    console.error(`❌ Publishing failed: ${error.message}`);
    
    // Restore development dependencies even on failure
    if (!dryRun) {
      try {
        restoreDevDependencies();
      } catch (restoreError) {
        console.error(`❌ Failed to restore dev dependencies: ${restoreError.message}`);
      }
    }
    
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
FML Runner Versioning Utility

Usage:
  node scripts/version.js <command> [options]

Commands:
  current                 Show current version
  bump <type>             Bump version (patch, minor, major)
  set <version>           Set specific version
  publish [--dry-run]     Publish packages to npm
  prepare-publish         Convert file: dependencies to npm registry versions
  restore-dev             Restore file: dependencies for development
  tag                     Create git tag for current version

Examples:
  node scripts/version.js current
  node scripts/version.js bump patch
  node scripts/version.js set 1.2.3
  node scripts/version.js publish --dry-run
  node scripts/version.js tag
`);
}

// Main execution
const [,, command, ...args] = process.argv;

switch (command) {
  case 'current':
    console.log(`Current version: ${getCurrentVersion()}`);
    break;
    
  case 'bump':
    const bumpType = args[0];
    if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
      console.error('❌ Please specify version type: major, minor, or patch');
      process.exit(1);
    }
    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion, bumpType);
    console.log(`Bumping version from ${currentVersion} to ${newVersion}`);
    updateAllPackages(newVersion);
    break;
    
  case 'set':
    const targetVersion = args[0];
    if (!targetVersion || !/^\d+\.\d+\.\d+$/.test(targetVersion)) {
      console.error('❌ Please specify a valid semantic version (e.g., 1.2.3)');
      process.exit(1);
    }
    console.log(`Setting version to ${targetVersion}`);
    updateAllPackages(targetVersion);
    break;
    
  case 'publish':
    const isDryRun = args.includes('--dry-run');
    publishPackages(isDryRun);
    break;
  
  case 'prepare-publish':
    const currentVersionForPrep = getCurrentVersion();
    prepareForPublishing(currentVersionForPrep);
    break;
    
  case 'restore-dev':
    restoreDevDependencies();
    break;
    
  case 'tag':
    const version = getCurrentVersion();
    createTag(version);
    break;
    
  default:
    showUsage();
    break;
}