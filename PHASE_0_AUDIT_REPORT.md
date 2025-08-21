# Phase 0 Audit Report: Deprecation and Security Analysis

**Date**: 2025-08-21  
**Branch**: `cleanup-phase-0-audit`  
**Goal**: Identify deprecated packages, security vulnerabilities, and maintenance issues

## Executive Summary

**🚨 CRITICAL FINDINGS:**
- **13 Security Vulnerabilities** (5 High, 6 Moderate, 2 Low)
- **4 React 19 Incompatible Packages** requiring immediate attention
- **0 Officially Deprecated Packages** (good news!)
- **2 Packages with Poor Maintenance** (last updated 2+ years ago)

---

## 1. Security Vulnerabilities (13 Total)

### 🔴 HIGH SEVERITY (5 vulnerabilities):
1. **braces@3.0.2** (CVE-2024-4068) - Memory exhaustion via malicious input
2. **dompurify@2.4.5** (CVE-2024-47875) - Nesting-based mXSS vulnerability  
3. **dompurify@2.4.5** (CVE-2025-26791) - Cross-site scripting with template literals
4. **semver@6.3.0** (CVE-2022-25883) - ReDoS via malicious version ranges
5. **semver@5.7.2** (CVE-2022-25883) - ReDoS via malicious version ranges

### 🟡 MODERATE SEVERITY (6 vulnerabilities):
- **prismjs@1.29.0 & 1.27.0** (CVE-2024-53382) - DOM Clobbering vulnerability
- **word-wrap@1.2.3** (CVE-2023-26115) - ReDoS vulnerability  
- **tough-cookie@4.1.3** (CVE-2023-26136) - Prototype pollution
- **minimatch@3.0.5** (CVE-2022-3517) - ReDoS vulnerability

### 🔵 LOW SEVERITY (2 vulnerabilities):
- **cookie@0.4.2** (CVE-2024-47764) - Cookie field manipulation
- **semver@6.3.1** (CVE-2022-25883) - ReDoS vulnerability

**IMPACT**: Multiple packages in dependency tree need urgent security updates.

---

## 2. React 19 Peer Dependency Issues

### 🚨 INCOMPATIBLE PACKAGES:

1. **@toast-ui/react-editor@3.2.3**
   - **Current**: Requires React ^17.0.1
   - **Problem**: Not compatible with React 19.1.1
   - **Status**: Latest version still React 17 only
   - **Action Required**: **HIGH PRIORITY** - Replace with modern editor

2. **react-copy-to-clipboard@5.1.0**
   - **Current**: Requires React ^15.3.0 || 16 || 17 || 18  
   - **Problem**: React 19 not supported
   - **Action Required**: Replace with Clipboard API

3. **react-debounce-input@3.3.0**
   - **Current**: Requires React ^15.3.0 || 16 || 17 || 18
   - **Problem**: React 19 not supported  
   - **Action Required**: Replace with custom hook

4. **react-intl@6.8.9**
   - **Current**: Requires React ^16.6.0 || 17 || 18
   - **Problem**: React 19 not supported
   - **Action Required**: Check for React 19 compatible version

---

## 3. Package Maintenance Status

### ✅ WELL MAINTAINED:
- **codemirror@5.65.20** - Last updated: 2025-08-10 (Recent!)
- **@toast-ui/react-editor@3.2.3** - Last updated: 2023-02-17 (Stable)
- **react-copy-to-clipboard@5.1.0** - Last updated: 2023-07-21 (Recent)

### ⚠️ POTENTIALLY STALE:
- **react-debounce-input@3.3.0** - Last updated: 2022-06-25 (2+ years old)

### ✅ DEPRECATION STATUS:
**GOOD NEWS**: None of the suspected packages are officially deprecated:
- @toast-ui/react-editor: ✅ NOT_DEPRECATED
- react-copy-to-clipboard: ✅ NOT_DEPRECATED  
- react-debounce-input: ✅ NOT_DEPRECATED
- codemirror: ✅ NOT_DEPRECATED
- env-cmd: ✅ NOT_DEPRECATED
- react-tag-input: ✅ NOT_DEPRECATED
- remove-markdown: ✅ NOT_DEPRECATED
- react-intl: ✅ NOT_DEPRECATED

---

## 4. Missing Dependencies Analysis

From `yarn check`, these dependencies are missing from package.json:

### 🔧 BUILD TOOLS:
- **picomatch** - Required by vite, vitest, tinyglobby
- **fdir** - Required by vite, tinyglobby  
- **@types/node** version mismatch (need ^20.19.0 || >=22.12.0)

### 🔧 TEST TOOLS:
- **msw version conflict** - Vitest requires ^2.4.9, currently have 1.3.5

---

## 5. Recommended Action Plan

### PHASE 1: SECURITY FIXES (URGENT)
**Priority**: 🚨 CRITICAL
1. Update dompurify (via @toast-ui/react-editor dependency)
2. Update semver, braces, word-wrap dependencies
3. Update prismjs (via react-syntax-highlighter)

### PHASE 2: REACT 19 COMPATIBILITY (HIGH)  
**Priority**: 🔴 HIGH
1. **@toast-ui/react-editor** → Research Monaco Editor, Lexical, or TinyMCE
2. **react-copy-to-clipboard** → Replace with `navigator.clipboard` API
3. **react-debounce-input** → Replace with custom `useDebounce` hook
4. **react-intl** → Upgrade to latest version or find React 19 compatible alternative

### PHASE 3: DEPENDENCY RESOLUTION (MEDIUM)
**Priority**: 🟡 MEDIUM
1. Add missing dependencies: picomatch, fdir
2. Update @types/node to compatible version
3. Resolve MSW version conflict

### PHASE 4: PACKAGE MODERNIZATION (LOW)
**Priority**: 🔵 LOW
1. Remove env-cmd if redundant with Vite
2. Evaluate if codemirror v6 upgrade needed
3. Clean up unused dependencies

---

## 6. Estimated Effort & Risk

| Component | Effort | Risk | Impact |
|-----------|--------|------|---------|
| Security Updates | Low | Low | High |
| Toast UI Editor Replacement | **High** | **High** | **High** |
| Clipboard API Migration | Low | Low | Low |
| Debounce Hook Migration | Low | Low | Low |
| React Intl Update | Medium | Medium | Medium |
| Missing Dependencies | Low | Low | Medium |

---

## 7. Alternative Package Research

### FOR @toast-ui/react-editor:
1. **Monaco Editor** (@monaco-editor/react)
   - Pros: VSCode editor, excellent React 19 support
   - Cons: Larger bundle size
   
2. **Lexical** (@lexical/react)
   - Pros: Meta/Facebook, modern architecture, React 19 ready
   - Cons: More complex API
   
3. **TinyMCE** (@tinymce/tinymce-react)
   - Pros: Mature, feature-rich, React 19 support
   - Cons: Commercial license for some features

### FOR react-intl:
1. **@formatjs/react-intl** (latest)
   - Check if newer version supports React 19
   
2. **react-i18next**
   - Modern alternative with React 19 support

---

## 8. Next Steps

**RECOMMENDATION**: Proceed with cleanup phases in this order:

1. ✅ **Phase 0 Complete** - Audit finished
2. 🚨 **Phase 1**: Fix security vulnerabilities (start immediately)
3. 🔴 **Phase 2**: Address React 19 compatibility  
4. 🟡 **Phase 3**: Resolve missing dependencies
5. 🔵 **Phase 4**: Optional modernization

**CRITICAL**: The @toast-ui/react-editor replacement will require the most work and should be planned as a separate sub-project due to its complexity.

---

**Status**: AUDIT COMPLETE ✅  
**Ready for**: Phase 1 implementation with user approval