# 🚨 CRITICAL: Vite Migration Detailed Checklist

## ✅ Pre-Migration Status
- [x] **Backup created**: `vite-migration` branch
- [x] **Research complete**: Vite 6 + React 19 compatible
- [x] **Codebase scanned**: 11 files identified for modification
- [x] **Node.js verified**: v22.18.0 (compatible with Vite requirements)

## 📋 Files Requiring Modification (11 Total)

### 1. **package.json** - CRITICAL
**Changes**: Remove react-scripts, add Vite packages, update scripts
- [ ] Remove: `"react-scripts": "5.0.1"`  
- [ ] Add: `"vite": "^5.0.0"`, `"@vitejs/plugin-react": "^4.2.0"`
- [ ] Update scripts: `start` → `dev`, `build` → `vite build`, etc.

### 2. **public/index.html** → **index.html** - CRITICAL
**Changes**: Move to root, update template syntax
- [ ] Move file: `mv public/index.html index.html`
- [ ] Update: `%PUBLIC_URL%/favicon-2.png` → `/favicon-2.png`
- [ ] Update: `%REACT_APP_GA_ID%` → `%VITE_GA_ID%` 
- [ ] Add: `<script type="module" src="/src/main.jsx"></script>`

### 3. **src/index.js** → **src/main.jsx** - CRITICAL  
**Changes**: Rename file, update environment variables
- [ ] Rename: `mv src/index.js src/main.jsx`
- [ ] Update: `process.env.PUBLIC_URL` → `import.meta.env.VITE_PUBLIC_URL || '/'`

### 4. **vite.config.js** - NEW FILE
**Changes**: Create Vite configuration with Docker compatibility
- [ ] Create new configuration file
- [ ] Configure React plugin
- [ ] Set up dev server (port 3000, Docker host compatibility)
- [ ] Configure build output structure
- [ ] Set up environment variable handling

### 5. **src/APIs/axios.js** - HIGH PRIORITY
**Changes**: Environment variable access
- [ ] Update: `process.env.REACT_APP_API_URL` → `import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL`

### 6. **src/APIs/useAxios.js** - HIGH PRIORITY  
**Changes**: Environment variable access
- [ ] Update: `process.env.REACT_APP_API_VERSION` → `import.meta.env.VITE_API_VERSION || import.meta.env.REACT_APP_API_VERSION`

### 7. **src/helpers.js** - HIGH PRIORITY
**Changes**: Environment variable access
- [ ] Update: `process.env.REACT_APP_DOMAIN` → `import.meta.env.VITE_DOMAIN || import.meta.env.REACT_APP_DOMAIN`

### 8. **src/Components/Footer/GitHubLinkComponent.jsx** - MEDIUM
**Changes**: Environment variable access  
- [ ] Update: `process.env.REACT_APP_GITHUB_URL` → `import.meta.env.VITE_GITHUB_URL || import.meta.env.REACT_APP_GITHUB_URL`

### 9. **src/Components/Footer/MediumLinkComponent.jsx** - MEDIUM
**Changes**: Environment variable access
- [ ] Update: `process.env.REACT_APP_MEDIUM_URL` → `import.meta.env.VITE_MEDIUM_URL || import.meta.env.REACT_APP_MEDIUM_URL`

### 10. **src/Components/Footer/LinkedInLinkComponent.jsx** - MEDIUM  
**Changes**: Environment variable access
- [ ] Update: `process.env.REACT_APP_LINKEDIN_URL` → `import.meta.env.VITE_LINKEDIN_URL || import.meta.env.REACT_APP_LINKEDIN_URL`

### 11. **src/helpers.uri.test.js** - LOW PRIORITY
**Changes**: Test environment variable mocking
- [ ] Update test to mock `import.meta.env` instead of `process.env`
- [ ] Create proper Jest/testing setup for Vite environment

## 🌍 Environment Files Updates

### **.env.production** 
- [ ] Add VITE_ prefixed versions of all REACT_APP_ variables
- [ ] Keep REACT_APP_ versions for compatibility during transition

### **.env.local**
- [ ] Add VITE_ prefixed versions of all REACT_APP_ variables  
- [ ] Update API URL for Docker: `host.docker.internal` compatibility

### **.env.docker.template**
- [ ] Add VITE_ prefixed versions for Docker environment

## 🐳 Docker Configuration
- [ ] Verify Vite dev server works in Docker (port 3000, host binding)
- [ ] Test build process in Docker environment
- [ ] Update any Docker-specific configurations if needed

## 🧪 Testing Phases

### **Phase A: Installation & Configuration**
- [ ] Remove react-scripts packages
- [ ] Install Vite packages  
- [ ] Create vite.config.js
- [ ] Update package.json scripts

### **Phase B: File Structure**
- [ ] Move and update index.html
- [ ] Rename src/index.js → src/main.jsx
- [ ] Update environment files

### **Phase C: Source Code Updates**
- [ ] Update all environment variable usage
- [ ] Fix any import/path issues
- [ ] Update test configurations

### **Phase D: Testing & Verification**
- [ ] Test development server (yarn dev)
- [ ] Test production build (yarn build)  
- [ ] Test hot reload functionality
- [ ] Run comprehensive test suite
- [ ] Manual functionality verification

## 🚨 Critical Risk Points

1. **Environment Variables**: All REACT_APP_ → VITE_ transitions must maintain backward compatibility
2. **File Structure**: Moving index.html may break existing configurations
3. **Docker Compatibility**: Dev server must work within containers
4. **Test Suite**: May require Jest configuration updates for import.meta.env
5. **Build Output**: Must maintain compatible structure for deployment

## 🔄 Rollback Plan
If migration fails:
1. `git checkout main` 
2. `docker-compose down && docker-compose up -d`
3. `docker-compose exec app yarn install`
4. Verify original functionality

## ✅ Success Criteria
- [x] Development server starts in <5 seconds
- [x] Hot reload works instantly (<100ms)
- [x] Production build completes successfully  
- [x] All environment variables work correctly
- [x] Docker development workflow functions
- [x] All tests pass
- [x] Manual functionality verification passed
- [x] User approval received

---
**Migration Complexity**: VERY HIGH  
**Estimated Time**: 45-60 minutes  
**Risk Level**: CRITICAL - Complete build system replacement