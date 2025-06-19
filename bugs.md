# Basketball Coach App - Bug Report

## 🔴 Critical Issues (High Priority)

### 1. Missing Dynamic Route Pages (404 Errors)
**Impact:** Users get 404 errors when clicking View/Edit buttons
**Files Affected:**
- `/app/players/[id]/page.tsx` - Missing player detail page
- `/app/players/[id]/edit/page.tsx` - Missing player edit page  
- `/app/teams/[id]/page.tsx` - Missing team detail page
- `/app/teams/[id]/edit/page.tsx` - Missing team edit page
- `/app/gameplans/[id]/page.tsx` - Missing game plan detail page
- `/app/gameplans/[id]/edit/page.tsx` - Missing game plan edit page
- `/app/plays/[id]/page.tsx` - Missing play detail page

**How to Reproduce:**
1. Go to Players, Teams, Game Plans, or Plays pages
2. Click "View" or "Edit" on any item
3. Results in 404 error

### 2. TypeScript Compilation Errors
**Impact:** Build failures and type safety issues
**Files Affected:**

#### Authentication Type Mismatch  
- **File:** `lib/auth.ts:82`
- **Error:** `string` is not assignable to `UserRole`
- **Fix:** Cast `token.role` to `UserRole` type

#### Jest Testing Type Errors
- **File:** `components/__tests__/Button.test.tsx`
- **Error:** Missing Jest DOM matchers types
- **Fix:** Install `@testing-library/jest-dom` types

#### Prisma Query Type Issues
- **File:** `modules/plays/repositories/PlayRepository.ts:294`
- **Error:** `tags` property doesn't exist in update mutation
- **Fix:** Correct the bulk update operation

#### JSON Type Conversion Issues
- **Files:** Multiple service files
- **Locations:** 
  - `modules/plays/services/PlayService.ts:49, 242, 77, 271, 308, 328, 526`
  - `modules/users/services/UserService.ts:371, 477`
- **Error:** Unsafe JSON to object conversions
- **Fix:** Add proper type guards and validation

## 🟡 Medium Priority Issues

### 3. Empty Forms Directory
**Impact:** Planned form components not implemented
**File:** `components/forms/` (empty directory)
**Description:** Directory exists but contains no form components, suggesting incomplete feature implementation

### 4. Missing ESLint Configuration  
**Impact:** No code quality enforcement
**Issue:** Running `npm run lint` prompts for setup instead of running
**Fix:** Complete ESLint configuration setup

### 5. Play Designer Query Parameter Support
**Impact:** Edit links won't work properly
**File:** `app/designer/page.tsx`
**Issue:** Designer page doesn't handle `playId` query parameter for editing existing plays
**Current:** `onClick={() => window.open('/designer?playId=${play.id}', '_blank')}`
**Fix:** Add support for loading play data when `playId` is provided

### 6. Missing Loading States
**Impact:** Poor user experience during data fetching
**Files:** Various pages that fetch data
**Issue:** Most pages don't show loading indicators when fetching data from APIs

### 7. API Input Validation
**Impact:** Potential runtime errors with malformed data
**Files:** Most API route files in `app/api/`
**Issue:** Limited input validation on request bodies

## 🟢 Low Priority Issues

### 8. Type Safety Improvements
**Files:** Various components
**Issues:**
- `PlayDesigner.tsx` uses `any` type for stage ref
- Various unsafe type assertions throughout codebase
- Missing strict null checks in some components

### 9. Database Schema Consistency
**Impact:** Potential runtime errors in complex queries
**Issue:** Some TypeScript types don't perfectly match Prisma schema usage, particularly around JSON fields

### 10. Console Warnings
**Issues:**
- React key warnings in some list components
- Potential accessibility warnings for interactive elements without proper ARIA labels

## 📋 Bug Fixing Roadmap

### Phase 1: Critical Fixes (Immediate)
1. ✅ **FIXED:** Create missing dynamic route pages for players, teams, game plans, and plays
2. ✅ **FIXED:** Fix TypeScript compilation errors in auth and service files
3. ✅ **FIXED:** Add playId query parameter support to designer page

### Phase 2: Medium Priority (Next Sprint)
1. **TODO:** Implement form components in empty forms directory
2. **TODO:** Complete ESLint configuration setup
3. **TODO:** Add loading states to all data-fetching pages
4. **TODO:** Add comprehensive input validation to API routes

### Phase 3: Low Priority (Future)
1. **TODO:** Improve type safety throughout codebase
2. **TODO:** Add comprehensive error boundaries
3. **TODO:** Implement proper accessibility features
4. **TODO:** Add performance optimizations

## 🧪 Testing Status

### Current Test Issues:
- Jest configuration has module name mapping issue (fixed)
- 1 test failing due to mock expectations mismatch
- Test coverage below thresholds (expected for MVP)

### Tests Working:
- Basic component rendering tests
- Button component functionality tests
- Jest and React Testing Library setup functional

## 🚀 Next Steps

1. **Immediate:** Complete the missing dynamic route pages
2. **Short-term:** Fix remaining TypeScript errors for clean builds  
3. **Medium-term:** Implement comprehensive error handling and loading states
4. **Long-term:** Improve type safety and add comprehensive test coverage

---

**Last Updated:** 2025-06-18  
**Status:** Initial bug inventory complete, critical fixes in progress