# Manual Debug Guidelines

## Overview
When debugging specific issues, we focus on targeted manual testing rather than automated tests to get real-world user feedback and accurate console output.

## Process

### 1. Issue Focus
- When using debug commands with specific arguments, concentrate solely on that issue
- Avoid scope creep or fixing unrelated problems during debug sessions
- Keep changes minimal and targeted to the specific problem

### 2. Console Logging Strategy
- Add strategic `console.log` statements at key decision points
- Include relevant state information and execution flow markers
- Use distinctive prefixes/emojis for easy identification:
    - `🔧` for initialization/setup
    - `🎯` for event detection
    - `✅` for success states
    - `🚫` for blocked/prevented actions
    - `⚠️` for warnings or edge cases
    - `🧹` for cleanup operations

### 3. Manual Testing Protocol
- **DO NOT** run automated tests after code modifications
- **DO** restart development environment to ensure changes are reflected
- **DO** let the user perform manual testing in the browser
- **DO** ask for specific console log feedback from the user
- **DO** request step-by-step user actions and their results

### 4. User Feedback Collection
- Ask user to open browser developer console
- Request specific console output related to the debug logs
- Ask for step-by-step description of what they observe
- Collect information about expected vs actual behavior
- Note any error messages or warnings that appear

### 5. Iterative Debugging
- Analyze user feedback before making next changes
- Add more targeted logging if initial feedback is insufficient
- Make incremental changes based on console output analysis
- Repeat the manual test cycle until issue is resolved

### 6. Debug Log Cleanup
- Remove or reduce debug logging once issue is identified and fixed
- Keep minimal logging for critical decision points if needed for future debugging
- Document the root cause and solution for future reference

## Example Debug Session Flow

1. **Issue Identification**: User reports hover effects not working
2. **Add Targeted Logging**: Add console logs to hover event handlers and state checks
3. **User Testing**: User hovers over elements and reports console output
4. **Analysis**: Review console logs to identify root cause
5. **Fix Implementation**: Make targeted fix based on log analysis
6. **Verification**: User tests again and confirms fix works
7. **Cleanup**: Remove excessive debug logging, keep minimal logging for edge cases

## Benefits of Manual Testing Approach

- **Real Environment**: Tests actual user interactions in real browser environment
- **Accurate State**: Console logs show actual runtime state, not mocked test state
- **User Experience**: Validates that fixes work from user perspective
- **Complex Interactions**: Can test complex interaction sequences that are hard to automate
- **Browser-Specific Issues**: Catches browser-specific behaviors and edge cases