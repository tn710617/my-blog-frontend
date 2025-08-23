# Test Maintenance Guidelines

**Project**: React Blog Frontend  
**Created**: 2025-08-23  
**Purpose**: Guide for maintaining test quality and consistency

## 🎯 Test Quality Standards

### 1. Test Structure
- Use descriptive test names that explain behavior, not implementation
- Follow AAA pattern: Arrange, Act, Assert
- Group related tests in `describe` blocks
- Keep tests focused on single behaviors

### 2. React Testing Library Best Practices
- Prefer queries that reflect how users interact with the app:
  - `getByText()`, `getByRole()`, `getByLabelText()`
  - Avoid `getByTestId()` unless necessary
- Use `screen` for queries when possible
- Wrap state updates in `act()` when needed
- Clean up side effects in `afterEach` hooks

### 3. Async Testing
- Use `findBy*` queries for async elements
- Wrap timer operations with proper `act()` calls
- Clean up timers and subscriptions in test cleanup

## 🔧 Common Patterns

### Component Testing Template
```javascript
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IntlProvider } from 'react-intl'
import Component from '../Component'

const renderWithIntl = (component, locale = 'en') => {
  const messages = locale === 'en' ? enMessages : zhMessages
  return render(
    <IntlProvider locale={locale} messages={messages}>
      {component}
    </IntlProvider>
  )
}

describe('Component', () => {
  beforeEach(() => {
    // Setup common to all tests
    vi.clearAllMocks()
  })

  it('should render correctly with default props', () => {
    renderWithIntl(<Component />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    renderWithIntl(<Component />)
    
    act(() => {
      fireEvent.click(screen.getByRole('button'))
    })
    
    expect(screen.getByText('Updated text')).toBeInTheDocument()
  })
})
```

### Zustand Store Testing Template
```javascript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../store'

describe('Store', () => {
  beforeEach(() => {
    useStore.setState(useStore.getInitialState())
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useStore())
    expect(result.current.someProperty).toBe('defaultValue')
  })

  it('should update state correctly', () => {
    const { result } = renderHook(() => useStore())
    
    act(() => {
      result.current.updateState('newValue')
    })
    
    expect(result.current.someProperty).toBe('newValue')
  })
})
```

### Hook Testing with Timers
```javascript
import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useCustomHook } from '../useCustomHook'

describe('useCustomHook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      vi.runAllTimers()
    })
    vi.useRealTimers()
  })

  it('should handle timer-based behavior', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useCustomHook(value),
      { initialProps: { value: 'initial' } }
    )

    act(() => {
      rerender({ value: 'updated' })
    })

    vi.advanceTimersByTime(500)
    
    expect(result.current).toBe('updated')
  })
})
```

## 🚨 Common Issues and Solutions

### 1. Act Warnings
**Problem**: "An update to TestComponent inside a test was not wrapped in act(...)"

**Solutions**:
- Wrap state-changing operations in `act()`
- For timer-based hooks, ensure cleanup is wrapped in `act()`
- Use `vi.runAllTimers()` in cleanup instead of `vi.runOnlyPendingTimers()`

### 2. Test Isolation Issues
**Problem**: Tests fail when run together but pass individually

**Solutions**:
- Reset store state in `beforeEach` hooks
- Clear mocks with `vi.clearAllMocks()`
- Clean up DOM with `cleanup()` if needed
- Reset modules with `vi.resetModules()` for fresh imports

### 3. Router Testing Challenges
**Problem**: React Router v7 mocking difficulties

**Solutions**:
- Use memory router for isolated component tests
- Mock `useNavigate` and `useLocation` hooks explicitly
- Test navigation behavior separately from component rendering

### 4. Internationalization Testing
**Problem**: Missing translation keys or locale switching issues

**Solutions**:
- Always render components within `IntlProvider`
- Test both English and Chinese translations
- Mock locale store state for predictable tests
- Handle missing translation keys gracefully

## 📊 Performance Guidelines

### Target Metrics
- **Test Suite Duration**: < 2 minutes total
- **Individual Test Files**: < 5 seconds each
- **Component Tests**: < 100ms each
- **Store Tests**: < 50ms each

### Optimization Strategies
- Use fake timers for debounced/delayed operations
- Mock expensive operations (API calls, large computations)
- Avoid unnecessary DOM operations in test setup
- Batch related assertions in single tests when appropriate

## 🔄 Maintenance Workflow

### Daily Development
1. **Write Tests First**: Follow TDD approach for new features
2. **Run Affected Tests**: Test only changed files during development
3. **Fix Failing Tests**: Address test failures immediately
4. **Update Tests**: Modify tests when changing existing functionality

### Pre-Commit Checklist
- [ ] All tests pass: `yarn test --run`
- [ ] No act() warnings in test output
- [ ] New tests added for new functionality
- [ ] Removed/updated tests for deleted/changed code
- [ ] Test coverage maintained or improved

### Weekly Review
- [ ] Review test performance metrics
- [ ] Identify and fix flaky tests
- [ ] Update test utilities and shared patterns
- [ ] Remove obsolete tests for deleted features

### Monthly Cleanup
- [ ] Review test coverage reports
- [ ] Refactor complex test files
- [ ] Update testing dependencies
- [ ] Document new testing patterns discovered

## 🎪 Docker Environment

### Required Commands
Always use Docker for consistent test environment:

```bash
# Run all tests
docker-compose exec app yarn test --run

# Run specific test file
docker-compose exec app yarn test path/to/test.js --run

# Watch mode for development
docker-compose exec app yarn test --watchAll

# Coverage report
docker-compose exec app yarn test --coverage --watchAll=false
```

### Container Restart Requirements
Restart containers when:
- Modifying test files (changes may not reflect immediately)
- Adding new test dependencies
- Changing test configuration
- Experiencing cached test results

```bash
docker-compose restart
# or for clean restart:
docker-compose down && docker-compose up -d
```

## 📈 Test Coverage Strategy

### Coverage Targets
- **Critical Paths**: 100% (authentication, post CRUD)
- **Components**: 80% (UI components, forms)
- **Stores**: 90% (business logic, state management)
- **Utilities**: 85% (helper functions)
- **Integration**: 60% (component + API interactions)

### Coverage Monitoring
```bash
# Generate coverage report
docker-compose exec app yarn test --coverage --watchAll=false

# View coverage in browser
open coverage/index.html
```

### Focus Areas
1. **User Journeys**: Test complete workflows users would experience
2. **Error Handling**: Test failure scenarios and error recovery
3. **Edge Cases**: Test boundary conditions and unusual inputs
4. **Integration Points**: Test component interactions with APIs and stores

## 🔍 Debugging Test Issues

### Common Debugging Steps
1. **Isolate the Test**: Run single test file to isolate issues
2. **Check Console**: Look for console errors or warnings
3. **Inspect DOM**: Use `screen.debug()` to see rendered output
4. **Check Mock Setup**: Verify mocks are configured correctly
5. **Review Test Environment**: Ensure proper test setup

### Useful Debug Commands
```javascript
// See current DOM state
screen.debug()

// See specific element
screen.debug(screen.getByText('some text'))

// Log current hook state
console.log('Hook state:', result.current)

// Check if element exists without failing
screen.queryByText('optional text')
```

### Performance Debugging
```bash
# Run tests with performance profiling
docker-compose exec app yarn test --run --reporter=verbose

# Identify slow tests
docker-compose exec app yarn test --run | grep -E "✓.*[0-9]+ms$" | sort -k4 -nr
```

## 🎯 Quality Gates

### Before Merging PRs
- [ ] All tests pass in CI/CD
- [ ] No new act() warnings introduced
- [ ] Test coverage maintained or improved
- [ ] New features have corresponding tests
- [ ] Tests are properly documented and maintainable

### Release Checklist
- [ ] Full test suite passes
- [ ] Performance regression tests pass
- [ ] Cross-browser compatibility verified
- [ ] Accessibility tests pass
- [ ] Documentation updated for new testing patterns

---

**Maintained by**: Development Team  
**Last Updated**: 2025-08-23  
**Next Review**: Monthly during team retrospectives