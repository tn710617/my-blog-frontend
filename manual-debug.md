# Manual Debug Command

**Command**: `/manual-debug <goal>`

**Description**: Focus on debugging a specific issue using manual testing and console logging feedback

**Arguments**:
- `<goal>`: The specific issue or functionality to debug (e.g., "hover effects not working", "modal detection broken")

## Command Behavior

When this command is used with a goal argument, Claude will:

### 1. Issue Focus
- Concentrate solely on the specified goal/issue
- Avoid scope creep or fixing unrelated problems
- Keep changes minimal and targeted to the specific problem

### 2. Console Logging Strategy
- Add strategic `console.log` statements at key decision points
- Include relevant state information and execution flow markers
- Use distinctive prefixes/emojis for easy identification:
  - `🔧` for initialization/setup
  - `🎯` for event detection/triggers
  - `✅` for success states
  - `🚫` for blocked/prevented actions
  - `⚠️` for warnings or edge cases
  - `🧹` for cleanup operations
  - `🔍` for state inspection

### 3. Manual Testing Protocol
- **DO NOT** run automated tests after code modifications
- **DO** restart development environment (docker-compose restart)
- **DO** let the user perform manual testing in the browser
- **DO** ask for specific console log feedback from the user
- **DO** request step-by-step user actions and their results

### 4. User Feedback Collection Process
- Ask user to open browser developer console
- Request specific console output related to the debug logs
- Ask for step-by-step description of what they observe
- Collect information about expected vs actual behavior
- Note any error messages or warnings that appear

### 5. Iterative Debugging Cycle
1. **Add Logging**: Insert targeted console logs for the specific goal
2. **User Tests**: User performs manual actions and reports console output
3. **Analyze**: Review console logs to identify root cause
4. **Fix**: Make incremental changes based on log analysis
5. **Repeat**: Continue cycle until goal is achieved
6. **Cleanup**: Remove excessive debug logging once issue is resolved

## Example Usage

```
/manual-debug hover effects disabled during gesture modal
```

This would focus specifically on debugging why hover effects aren't being disabled when the Mapbox gesture modal is active.

## Expected Workflow

1. **Identify Target**: Focus on the specific goal provided
2. **Add Debug Logs**: Insert console logging at relevant code points
3. **Request User Testing**: Ask user to test specific interactions
4. **Collect Feedback**: Gather console output and behavior observations
5. **Iterate**: Make targeted changes based on real user feedback
6. **Verify**: Confirm fix works through additional manual testing
7. **Clean Up**: Remove or minimize debug logging

## Benefits

- **Real Environment**: Tests actual user interactions in real browser
- **Accurate State**: Console logs show actual runtime state vs mocked tests
- **User Experience**: Validates fixes work from user perspective
- **Complex Interactions**: Can test interaction sequences hard to automate
- **Browser-Specific**: Catches browser-specific behaviors and edge cases