#!/bin/bash

# FML Test Suite IG Generation Script
# This script builds the FHIR Implementation Guide for the test suite

echo "FML Execution Validation Test Suite - IG Generation"
echo "=================================================="

# Check if sushi is available
if ! command -v sushi &> /dev/null; then
    echo "Error: SUSHI not found. Please install SUSHI:"
    echo "npm install -g fsh-sushi"
    exit 1
fi

echo "1. Generating test plan from existing test data..."
npm run test-suite:generate

echo "2. Compiling FSH files with SUSHI..."
sushi

if [ $? -eq 0 ]; then
    echo "✓ SUSHI compilation successful"
else
    echo "✗ SUSHI compilation failed"
    exit 1
fi

echo "3. Implementation Guide generation complete!"
echo ""
echo "Generated files:"
echo "- output/: Compiled FHIR resources"
echo "- fsh-generated/: Generated FSH artifacts"
echo ""
echo "To import additional test data, run:"
echo "  npm run test-suite:import"
echo ""
echo "To view the generated resources:"
echo "  ls output/"