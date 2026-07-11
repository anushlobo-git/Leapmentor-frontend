# Auth Login Flow

```mermaid
sequenceDiagram
  actor User
  participant LoginForm as src/features/auth/components/LoginForm.jsx
  participant Thunk as src/features/auth/store/authSlice.js
  participant Axios as src/lib/axiosInstance.js
  participant API as Backend /auth/login
  participant Store as Redux auth slice

  User->>LoginForm: submit email + password
  LoginForm->>Thunk: dispatch(loginUser({ email, password }))
  Thunk->>Axios: POST /auth/login
  Axios->>API: request with credentials + correlation ID
  API-->>Axios: 200 + user + accessToken + HttpOnly cookies
  Axios-->>Thunk: res.data
  Thunk-->>Store: loginUser.fulfilled stores user and accessToken
  Store-->>LoginForm: loading false + success state
  Note over User,Store: ProtectedRoute reads authRole cookie and App rehydrates after refresh when needed
```

## Notes

- The login thunk lives in `src/features/auth/store/authSlice.js`.
- The authenticated axios client lives in `src/lib/axiosInstance.js`.
- The backend sets the refresh cookie; the frontend stores the access token in Redux.
