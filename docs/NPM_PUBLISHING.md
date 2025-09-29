# NPM Publishing Guide

This document describes the npm publishing process for the FML Runner monorepo packages.

## Package Overview

The FML Runner project consists of 4 npm packages published to the public npm registry:

| Package | Description | NPM Link |
|---------|-------------|----------|
| **fmlrunner** | Core FML library with compilation and execution | [npm](https://www.npmjs.com/package/fmlrunner) |
| **fmlrunner-rest** | REST API server with FHIR endpoints | [npm](https://www.npmjs.com/package/fmlrunner-rest) |
| **fmlrunner-mcp** | Model Context Protocol interface for AI tools | [npm](https://www.npmjs.com/package/fmlrunner-mcp) |
| **fmlrunner-web** | React web interface and documentation | [npm](https://www.npmjs.com/package/fmlrunner-web) |

## Versioning Strategy

All packages use **synchronized semantic versioning** (SEMVER):
- **Patch** (0.1.1): Bug fixes, small improvements
- **Minor** (0.2.0): New features, backward-compatible changes
- **Major** (1.0.0): Breaking changes, major refactoring

### Version Management

Use the included versioning utility:

```bash
# Check current version
npm run version:current

# Bump version
npm run version:patch    # 0.1.0 → 0.1.1
npm run version:minor    # 0.1.0 → 0.2.0  
npm run version:major    # 0.1.0 → 1.0.0

# Set specific version
npm run version:set 1.2.3
```

## Publishing Methods

### 1. Automated Publishing (Recommended)

**Via GitHub Actions Workflow:**

1. **Manual Trigger:**
   - Go to Actions → "Publish to NPM"
   - Click "Run workflow"
   - Select version type (patch/minor/major)
   - Choose options:
     - ✅ Publish to NPM registry
     - ❌ Dry run (for testing)

2. **Release Trigger:**
   - Create a new release on GitHub
   - Tag format: `v1.2.3`
   - Packages will be automatically published

### 2. Manual Publishing

**Prerequisites:**
```bash
# Set up npm authentication
npm login
# Enter your npm credentials

# Or use npm token
npm config set registry https://registry.npmjs.org/
npm config set //registry.npmjs.org/:_authToken YOUR_NPM_TOKEN
```

**Publishing Steps:**
```bash
# 1. Quality checks
npm run build:kotlin   # Build Kotlin/JS core first
npm run lint
npm run test
npm run build

# 2. Dry run (test without publishing)
npm run publish:dry-run

# 3. Publish all packages
npm run publish:all

# 4. Create git tag
npm run tag
git push origin --tags
```

## Publishing Workflow Details

### Dependency Order

Packages are published in dependency order:

1. **@litlfred/fmlrunner-core** (Kotlin/JS core) - published first
2. **fmlrunner** (main library) - depends on kotlin-core  
3. **fmlrunner-rest** (depends on fmlrunner)
4. **fmlrunner-mcp** (depends on fmlrunner)  
5. **fmlrunner-web** (depends on fmlrunner)

### Quality Gates

Before publishing, the following checks are performed:

- ✅ **Kotlin Build** - Kotlin/JS compilation and packaging
- ✅ **Linting** - ESLint validation
- ✅ **Testing** - All test suites pass (Kotlin + TypeScript)
- ✅ **Building** - TypeScript compilation
- ✅ **Schema Validation** - JSON schemas compile
- ✅ **Package Verification** - Contents check

### Post-Publishing

After successful publishing:

- 🏷️ **Git Tag** - Version tag created (`v1.2.3`)
- 📖 **GitHub Release** - Release notes generated
- 📊 **Summary Report** - Publishing results displayed

## Environment Setup

### GitHub Repository Secrets

Configure these secrets in repository settings:

```bash
NPM_TOKEN=npm_your_publish_token_here
```

### NPM Token Setup

1. **Generate NPM Token:**
   ```bash
   npm login
   npm token create --read-only  # For CI/CD
   npm token create             # For publishing
   ```

2. **Add to GitHub Secrets:**
   - Go to repository Settings → Secrets → Actions
   - Add `NPM_TOKEN` with your token value

## Package Metadata

Each package includes comprehensive metadata:

### Core Features
- **Keywords** - Relevant search terms
- **Homepage** - GitHub repository link
- **Repository** - Git repository URL
- **Bug Reports** - Issues URL
- **License** - MIT license
- **Engine Requirements** - Node.js ≥16, npm ≥8

### Publishing Configuration
- **Public Access** - `access: public`
- **Registry** - https://registry.npmjs.org/
- **File Inclusion** - Only necessary files included
- **Pre-publish Hooks** - Automated quality checks

## Common Commands

```bash
# Development
npm install                    # Install all dependencies
npm run dev                   # Start development servers
npm run build                 # Build all packages
npm run test                  # Run all tests

# Versioning
npm run version:current       # Show current version
npm run version:patch         # Bump patch version
npm run version:minor         # Bump minor version
npm run version:major         # Bump major version

# Publishing
npm run publish:dry-run       # Test publishing (no actual publish)
npm run publish:all           # Publish all packages
npm run release               # Full release process

# Utilities
npm run clean                 # Clean build artifacts
npm run lint                  # Run linting
node scripts/version.js --help # Versioning utility help
```

## Troubleshooting

### Common Issues

**1. Authentication Errors**
```bash
npm whoami                    # Check if logged in
npm login                     # Re-authenticate
```

**2. Version Conflicts**
```bash
npm run version:current       # Check current version
npm view fmlrunner versions   # Check published versions
```

**3. Dependency Issues**
```bash
npm run clean                 # Clean build artifacts
npm ci                        # Fresh dependency install
npm run build                 # Rebuild packages
```

**4. Publishing Failures**
```bash
npm run publish:dry-run       # Test publishing
npm publish --access public --dry-run  # Manual dry run
```

### Getting Help

- 📋 **GitHub Issues** - [Report problems](https://github.com/litlfred/fmlrunner/issues)
- 📖 **Documentation** - [Project README](../README.md)
- 🔧 **Scripts** - `node scripts/version.js --help`

## Release Checklist

Before publishing a new version:

- [ ] All tests passing locally
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped appropriately
- [ ] Dependencies up to date
- [ ] Security vulnerabilities addressed
- [ ] Breaking changes documented
- [ ] GitHub Actions workflow green
- [ ] Dry run completed successfully

After publishing:

- [ ] Verify packages on npm registry
- [ ] Test installation of published packages
- [ ] Update project documentation
- [ ] Announce release if significant
- [ ] Monitor for issues/feedback

---

*This guide is part of the FML Runner project. For technical questions, please refer to the main documentation or open an issue.*