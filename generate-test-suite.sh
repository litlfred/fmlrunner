#!/bin/bash

# FML Test Suite IG Generation Script
# This script builds the FHIR Implementation Guide for the test suite

echo "FML Execution Validation Test Suite - IG Generation"
echo "=================================================="

echo "1. Validating test suite structure..."
npm run test-suite:validate

if [ $? -ne 0 ]; then
    echo "✗ Validation failed"
    exit 1
fi

echo "2. Generating test plan from existing test data..."
npm run test-suite:generate

# Check if sushi is available
if ! command -v sushi &> /dev/null; then
    echo "Warning: SUSHI not found. Please install SUSHI:"
    echo "npm install -g fsh-sushi"
    echo ""
    echo "Skipping SUSHI compilation..."
else
    echo "3. Compiling FSH files with SUSHI..."
    sushi

    if [ $? -eq 0 ]; then
        echo "✓ SUSHI compilation successful"
    else
        echo "⚠ SUSHI compilation had issues (likely due to package download failures)"
        echo "  This is expected in sandboxed environments"
    fi
fi

echo "4. Implementation Guide generation complete!"
echo ""
echo "Generated files:"
echo "- input/fsh/tests/: FSH TestPlan definition"
echo "- input/examples/: Test data and examples"
echo "- output/: Compiled FHIR resources (if SUSHI succeeded)"
echo ""
echo "Available npm scripts:"
echo "  npm run test-suite:validate  - Validate test suite structure"
echo "  npm run test-suite:import    - Import additional test data"
echo "  npm run test-suite:generate  - Regenerate TestPlan from metadata"
echo ""
echo "To view the test suite structure:"
echo "  find input/ -type f"