# E2E Tests for Alfred Agent Platform

## Setup

The E2E tests use Playwright to test the full UI workflow including:
- Navigation and routing
- Command palette functionality (⌘K shortcuts)
- Service health monitoring
- Plan page integration

## Prerequisites

Install system dependencies (Linux):
```bash
sudo npx playwright install-deps
# OR
sudo apt-get install libnspr4 libnss3 libasound2t64
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/ui.spec.ts
```

## Test Scenarios

### Main UI Smoke Test
- Navigates to dashboard
- Opens command palette with ⌘K
- Searches for "Phase 8 Plan"
- Validates plan page loads with correct content
- Checks service health indicators

### Navigation Tests
- Sidebar navigation functionality
- Quick actions dashboard integration
- URL routing validation

### Command Palette Tests
- Keyboard shortcuts (⌘K, Ctrl+K)
- ESC to close functionality
- Search and selection workflow

## CI/CD Integration

Tests are configured to run automatically with:
- Retries in CI environment
- HTML reporter output
- Trace collection on failures
- Automatic dev server startup