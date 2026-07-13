# Auth Utilities Refactoring Guide

## Overview

Duplication in auth files has been reduced by extracting common patterns into reusable utilities.

---

## Created Utilities

### 1. Password Validation (`@lib/validation/passwordValidation.js`)

**Purpose**: Centralized password validation logic

**Exported Functions**:

- `getPasswordValidation(password)` - Returns rules, passed count, and total
- `getPasswordStrength(passed)` - Returns label, color, and width for strength indicator
- `getPasswordRules()` - Returns array of password rules

**Usage**:

```javascript
import {
  getPasswordValidation,
  getPasswordStrength,
} from "@lib/validation/passwordValidation";

const { rules, passed } = getPasswordValidation(passwordValue);
const strength = getPasswordStrength(passed);
```

**Files Using This**:

- `RegisterForm.jsx`
- `ForgotPassword.jsx`
- `forgotPassword.utils.js`

---

### 2. Password Icons (`@lib/auth/passwordIconUtils.js`)

**Purpose**: Shared SVG icons for show/hide password toggles

**Exported**:

- `EyeIconSVG` - SVG for showing password
- `EyeOffIconSVG` - SVG for hiding password
- `getPasswordToggleIcon(isVisible)` - Returns appropriate icon

**Usage**:

```javascript
import { getPasswordToggleIcon } from "@lib/auth/passwordIconUtils";

<button onClick={() => setShowPassword(!showPassword)}>
  {getPasswordToggleIcon(showPassword)}
</button>;
```

**Files Using This**:

- `RegisterForm.jsx`
- `LoginForm.jsx`

---

### 3. OTP Utilities (`@lib/auth/otpUtils.js`)

**Purpose**: Common OTP input handling logic

**Exported Functions**:

- `handleOtpChange(value, index, otpArray, setOtpArray)`
- `handleOtpKeyDown(event, index, otpArray)`
- `handleOtpPaste(event, otpArray, setOtpArray)`
- `getOtpString(otpArray)` - Convert array to string
- `resetOtp()` - Reset OTP array
- `getOtpInputClasses()` - Standard OTP input styling

**Usage**:

```javascript
import {
  handleOtpChange,
  handleOtpPaste,
  getOtpString,
} from "@lib/auth/otpUtils";

// In form:
<input
  onChange={(e) => handleOtpChange(e.target.value, 0, otp, setOtp)}
  onKeyDown={(e) => handleOtpKeyDown(e, 0, otp)}
  onPaste={(e) => handleOtpPaste(e, otp, setOtp)}
  className={getOtpInputClasses()}
/>;
```

**Files Using This**:

- `VerifyEmail.jsx`
- `ForgotPassword.jsx`

---

### 4. Message Utilities (`@lib/auth/messageUtils.js`)

**Purpose**: Standardized message state and predefined messages

**Exported**:

- `INITIAL_MESSAGE_STATE` - Initial message state object
- `MESSAGE_TYPES` - Enum of message types
- `createErrorMessage(text)` - Create error message
- `createSuccessMessage(text)` - Create success message
- `AUTH_ERROR_MESSAGES` - Predefined error messages
- `AUTH_SUCCESS_MESSAGES` - Predefined success messages

**Usage**:

```javascript
import {
  createErrorMessage,
  createSuccessMessage,
  AUTH_ERROR_MESSAGES,
} from "@lib/auth/messageUtils";

setMsg(createErrorMessage(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS));
```

**Files Using This**:

- All auth forms (RegisterForm, LoginForm, ForgotPassword, etc.)

---

### 5. Redirect Utilities (`@lib/auth/redirectUtils.js`)

**Purpose**: Role-based routing and OAuth URL building

**Exported Functions**:

- `getPrimaryRole(roles)` - Get primary role from array
- `getDashboardPath(role)` - Get dashboard path for role
- `getOnboardingPath(role)` - Get onboarding path for role
- `getBaseUrl()` - Get API base URL
- `buildOAuthUrl(provider, params)` - Build OAuth redirect URL

**Exported**:

- `REDIRECT_DELAYS` - Common redirect delays

**Usage**:

```javascript
import {
  getPrimaryRole,
  getDashboardPath,
  buildOAuthUrl,
  REDIRECT_DELAYS,
} from "@lib/auth/redirectUtils";

const role = getPrimaryRole(user.roles);
setTimeout(() => navigate(getDashboardPath(role)), REDIRECT_DELAYS.MEDIUM);
```

**Files Using This**:

- `LoginForm.jsx`
- `RegisterForm.jsx`

---

## Duplication Reduction Summary

| Aspect                    | Before                                      | After                                  | Reduction  |
| ------------------------- | ------------------------------------------- | -------------------------------------- | ---------- |
| Password validation logic | Duplicated in RegisterForm & ForgotPassword | Centralized in `passwordValidation.js` | ~50 lines  |
| Password SVG icons        | Duplicated in RegisterForm & LoginForm      | Centralized in `passwordIconUtils.js`  | ~60 lines  |
| OTP handling              | Duplicated in VerifyEmail & ForgotPassword  | Centralized in `otpUtils.js`           | ~100 lines |
| Message patterns          | Scattered across all forms                  | Centralized in `messageUtils.js`       | ~80 lines  |
| Redirect logic            | Repeated helper functions                   | Centralized in `redirectUtils.js`      | ~40 lines  |

**Total Lines Reduced**: ~330 lines

---

## Next Steps to Further Reduce Duplication

1. **Extract Input Components**: Create reusable `EmailInput`, `PasswordInput`, `OtpInput` components
2. **Centralize Form Layouts**: Create `AuthFormLayout` component for consistent structure
3. **Message Banners**: Create `AuthMessageBanner` component with predefined messages
4. **Validate Across Files**: Run SonarQube to confirm duplication reduction in:
   - `MentorHomeTab.jsx`
   - `RequestStatusViews.jsx`
   - `SharedNotesTab.jsx`
   - `SharedHomeTab.jsx`
   - `AdminSettings.jsx`

---

## File Locations

All utilities are organized under:

- `/src/lib/validation/` - Validation logic
- `/src/lib/auth/` - Auth-specific utilities
