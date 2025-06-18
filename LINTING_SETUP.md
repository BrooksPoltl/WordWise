# Linting Setup - WordWise

## Overview
This project uses ESLint with Prettier for comprehensive code linting and formatting. The setup is configured to work with TypeScript, React, and Firebase.

## Tools Configured

### ESLint
- **Config**: Airbnb TypeScript with React hooks support
- **Parser**: @typescript-eslint/parser
- **Plugins**: TypeScript, React, React Hooks, JSX A11y, Import

### Prettier
- **Code Formatting**: Automatic code formatting on save
- **Configuration**: See `.prettierrc` for style preferences

### VS Code Integration
- **Auto-format**: Formats code on save
- **Auto-fix**: Fixes ESLint issues on save
- **Import Organization**: Organizes imports automatically

## Scripts

### Linting Scripts
```bash
npm run lint:check      # Check for linting issues (no fixes)
npm run lint            # Check with max warnings = 0
npm run lint:fix        # Auto-fix fixable issues
```

### Formatting Scripts
```bash
npm run format:check    # Check formatting (no changes)
npm run format          # Format src files
npm run format:all      # Format all project files
```

### Combined Scripts
```bash
npm run check-all       # Run typecheck + lint + format check
npm run fix-all         # Run lint:fix + format
```

## Current Status

After initial setup and auto-fix, there are **119 linting issues** remaining:
- **78 errors** (require manual fixes)
- **41 warnings** (mostly type-related)

### Major Issue Categories

1. **Missing Button Types** (~20 errors)
   - All buttons need `type="button"`, `type="submit"`, or `type="reset"`
   
2. **Accessibility Issues** (~15 errors)
   - Form labels need proper associations
   - Interactive elements need keyboard support
   
3. **React Best Practices** (~10 errors)
   - Self-closing components
   - Proper fragment usage
   - Escaped entities in JSX
   
4. **TypeScript Issues** (~20 errors)
   - Variable shadowing
   - Unused variables
   - Function return types
   
5. **Import/Dependency Issues** (~5 errors)
   - Missing dependencies for Tiptap packages
   - Class method usage patterns

## Recommended Fixes

### Quick Wins (Auto-fixable)
Most formatting and simple style issues have been auto-fixed.

### Manual Fixes Needed

1. **Button Types**: Add explicit type attributes
   ```tsx
   // Before
   <button onClick={handleClick}>Click me</button>
   
   // After  
   <button type="button" onClick={handleClick}>Click me</button>
   ```

2. **Form Labels**: Associate labels with form controls
   ```tsx
   // Before
   <label>Email</label>
   <input type="email" />
   
   // After
   <label htmlFor="email">Email</label>
   <input id="email" type="email" />
   ```

3. **Variable Shadowing**: Rename shadowed variables
   ```tsx
   // Before: 'error' shadows outer scope
   catch (error) { ... }
   
   // After
   catch (err) { ... }
   ```

## Configuration Files

- `.eslintrc.cjs` - ESLint configuration
- `.eslintignore` - Files/folders to ignore
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files/folders to skip formatting
- `.vscode/settings.json` - VS Code workspace settings

## IDE Setup

For VS Code users, the workspace is configured to:
- Format on save with Prettier
- Fix ESLint issues on save
- Organize imports automatically
- Validate TypeScript and React files

## Next Steps

1. **Gradual Cleanup**: Fix linting issues in small batches
2. **Pre-commit Hooks**: Consider adding Husky for pre-commit linting
3. **CI Integration**: Add linting checks to CI/CD pipeline
4. **Team Guidelines**: Establish code style guidelines

## Maintenance

- Run `npm run check-all` before committing
- Use `npm run fix-all` to auto-fix issues
- Review and update ESLint rules as needed
- Keep dependencies updated for security

## Notes

- TypeScript version (5.8.3) is newer than officially supported by @typescript-eslint
- Functions directory is excluded from linting
- Firebase export directories are ignored
- Console statements are allowed for error/warn levels only 