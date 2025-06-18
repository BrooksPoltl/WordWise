#!/bin/bash

# Lint Summary Script for WordWise
# Provides a categorized view of linting issues

echo "🔍 WordWise Linting Summary"
echo "=========================="
echo ""

# Run linter and capture output
lint_output=$(npm run lint:check 2>&1)

# Extract error/warning counts
error_count=$(echo "$lint_output" | grep -o '[0-9]* error' | head -1 | grep -o '[0-9]*')
warning_count=$(echo "$lint_output" | grep -o '[0-9]* warning' | head -1 | grep -o '[0-9]*')

echo "📊 Total Issues:"
echo "   Errors: ${error_count:-0}"
echo "   Warnings: ${warning_count:-0}"
echo ""

echo "🔧 Issue Categories:"
echo ""

# Button type issues
button_issues=$(echo "$lint_output" | grep -c "react/button-has-type")
echo "   Missing button types: $button_issues"

# Accessibility issues  
a11y_issues=$(echo "$lint_output" | grep -c "jsx-a11y/")
echo "   Accessibility: $a11y_issues"

# React issues
react_issues=$(echo "$lint_output" | grep -c "react/")
echo "   React best practices: $react_issues"

# TypeScript issues
ts_issues=$(echo "$lint_output" | grep -c "@typescript-eslint/")
echo "   TypeScript: $ts_issues"

# Import issues
import_issues=$(echo "$lint_output" | grep -c "import/")
echo "   Import/Dependencies: $import_issues"

echo ""
echo "🚀 Quick Actions:"
echo "   npm run lint:fix     # Auto-fix what's possible"
echo "   npm run format       # Format code"
echo "   npm run fix-all      # Fix + Format"
echo ""
echo "📖 See LINTING_SETUP.md for detailed guidance" 