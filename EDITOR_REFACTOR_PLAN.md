# Editor Refactor Plan: Toast UI → Monaco Editor

**Project**: React Blog Frontend  
**Goal**: Replace @toast-ui/react-editor with Monaco Editor for React 19 compatibility  
**Created**: 2025-08-21  
**Based on**: PACKAGE_CLEANUP_PLAN.md Phase 2 requirements  

## Problem Statement

**Current Issue**: @toast-ui/react-editor@3.2.3 (latest) only supports React ^17.0.1, incompatible with React 19.1.1.

**Impact**: Blocks React 19 compatibility migration and causes peer dependency conflicts.

## Solution Analysis

### Selected Alternative: Monaco Editor (@monaco-editor/react@4.7.0)

**Why Monaco Editor**:
- ✅ **React 19 Compatible**: Supports `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`
- ✅ **Production Ready**: Stable release, powers VSCode
- ✅ **TypeScript Support**: Excellent TypeScript/JavaScript editing
- ✅ **Markdown Support**: Can handle markdown editing with proper language configuration
- ✅ **Customizable**: Rich API for customization

**Rejected Alternatives**:
- **Lexical**: Only nightly builds available, too unstable
- **TinyMCE**: Only release candidate available, not stable

## Current Usage Analysis

### Files Using @toast-ui/react-editor:

Need to identify all files importing or using the Toast UI editor:

```bash
# Command to find usage:
grep -r "@toast-ui/react-editor\|ToastUIEditor" src/
```

### Features Currently Used:
- Markdown editing and preview
- WYSIWYG editing mode
- Image/file upload handling
- Content saving and loading
- Custom toolbar configuration

## Migration Strategy

### Phase 1: Analysis and Preparation
- [ ] **Identify all editor usage** in codebase
- [ ] **Document current editor configuration** and customizations
- [ ] **Analyze markdown handling** and preview functionality
- [ ] **Review image/file upload** implementation
- [ ] **Document editor state management** (if any)

### Phase 2: Monaco Editor Setup
- [ ] **Install Monaco Editor**: `@monaco-editor/react@4.7.0`
- [ ] **Configure Monaco** for markdown editing
- [ ] **Set up basic editor component** wrapper
- [ ] **Configure theme** to match current UI
- [ ] **Test basic functionality** in isolation

### Phase 3: Feature Migration
- [ ] **Implement markdown preview** functionality
- [ ] **Migrate image/file upload** handling
- [ ] **Port custom toolbar** features (if needed)
- [ ] **Handle content saving/loading** compatibility
- [ ] **Ensure proper form integration**

### Phase 4: Component Replacement
- [ ] **Replace editor in CreatePost** page
- [ ] **Replace editor in EditPost** page  
- [ ] **Update any other editor usage**
- [ ] **Remove @toast-ui/react-editor** dependency
- [ ] **Clean up Toast UI related imports**

### Phase 5: Testing and Validation
- [ ] **Test post creation** functionality
- [ ] **Test post editing** functionality
- [ ] **Test markdown preview** accuracy
- [ ] **Test image/file uploads**
- [ ] **Validate content compatibility** (existing posts)
- [ ] **Performance testing** (bundle size comparison)

### Phase 6: Final Integration
- [ ] **Run full test suite** (fix any breaking tests)
- [ ] **Manual testing** of all editor features
- [ ] **Verify accessibility** compliance
- [ ] **Update documentation** if needed

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|---------|------------|
| Content compatibility issues | Medium | High | Thorough testing with existing content |
| Feature parity gaps | Medium | Medium | Document features before migration |
| Bundle size increase | Low | Low | Monaco is well-optimized |
| User experience changes | Medium | Medium | Keep UI/UX as similar as possible |
| Migration complexity | High | High | Phased approach with rollback plan |

## Success Criteria

- [ ] ✅ **React 19 Compatibility**: No peer dependency conflicts
- [ ] ✅ **Feature Parity**: All current editor features working
- [ ] ✅ **Content Compatibility**: Existing posts render correctly
- [ ] ✅ **Performance**: Bundle size impact acceptable
- [ ] ✅ **User Experience**: Editing experience maintained or improved
- [ ] ✅ **Tests Passing**: All tests continue to work
- [ ] ✅ **Build Success**: Production build works without errors

## Rollback Strategy

**If migration fails**:
1. Revert Monaco Editor installation
2. Restore @toast-ui/react-editor 
3. Revert component changes
4. Use yarn check warnings as temporary workaround
5. Consider alternative editor solutions

## Implementation Timeline

**Estimated Effort**: 2-4 hours (complex replacement)  
**Risk Level**: High (core functionality replacement)  
**Blocking**: Yes (required for React 19 full compatibility)

## Branch Strategy

**Branch**: `editor-refactor-monaco`  
**Base**: Current cleanup branch  
**Merge Target**: cleanup-phase-2-react19-compatibility

---

**Status**: PLAN CREATED - READY FOR IMPLEMENTATION  
**Next Step**: Begin Phase 1 analysis of current editor usage