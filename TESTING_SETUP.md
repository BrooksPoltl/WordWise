# Testing Setup

This project uses Jest with React Testing Library for unit and integration testing.

## Configuration

- **Test Framework**: Jest
- **Testing Library**: React Testing Library
- **Environment**: jsdom (for DOM testing)
- **TypeScript Support**: ts-jest

## Scripts

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Test Files

Tests should be placed in one of these locations:
- `src/**/__tests__/**/*.(test|spec).(ts|tsx)`
- `src/**/*.(test|spec).(ts|tsx)`

## Configuration Files

- `jest.config.js` - Main Jest configuration
- `src/setupTests.ts` - Test setup file (runs before each test)

## Features

- **ES Modules Support**: Configured for ESM compatibility
- **TypeScript Support**: Full TypeScript support with ts-jest
- **React Testing**: React Testing Library configured
- **Firebase Mocking**: Firebase services mocked in setupTests.ts
- **CSS Module Support**: CSS imports mocked with identity-obj-proxy
- **Coverage Reports**: Coverage collection configured

## Build Integration

Tests are automatically run as part of the build process:
```bash
npm run build  # Runs: typecheck → lint → test → vite build
```

## Example Test

```typescript
describe('Basic Tests', () => {
  test('1 + 1 should equal 2', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Best Practices

1. Write tests alongside your components/utilities
2. Use descriptive test names
3. Mock external dependencies (Firebase, APIs)
4. Test user interactions, not implementation details
5. Aim for good coverage of critical paths 