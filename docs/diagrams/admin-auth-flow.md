# Admin Auth Flow

```mermaid
sequenceDiagram
  actor Admin
  participant Login as src/features/admin/pages/AdminLogin.jsx
  participant Context as src/features/admin/context/AdminAuthContext.jsx
  participant AdminAxios as src/lib/adminAxiosInstance.js
  participant API as Backend /admin/auth/login, /admin/auth/me, /admin/auth/refresh, /admin/auth/logout
  participant Guard as src/features/admin/components/AdminRoute.jsx
  participant Router as src/app/App.jsx

  Admin->>Login: submit email + password
  Login->>AdminAxios: POST /admin/auth/login
  AdminAxios->>API: request with credentials
  API-->>AdminAxios: admin payload + HttpOnly admin cookie
  AdminAxios-->>Login: response data
  Login->>Context: login(res.data.admin)
  Context-->>Guard: isAuthenticated = !!admin
  Login->>Router: navigate('/admin/users')
  Router->>Guard: render protected admin route
  Guard->>Context: read loading + isAuthenticated

  Context->>AdminAxios: GET /admin/auth/me with _skipAuthRedirect: true on mount
  AdminAxios->>API: session probe using cookie
  API-->>AdminAxios: current admin or 401/403

  alt request is unauthorized and refresh succeeds
    AdminAxios->>API: POST /admin/auth/refresh
    API-->>AdminAxios: refreshed session
    AdminAxios-->>Context: retry original request
  else refresh fails or request is unauthorized/forbidden
    AdminAxios-->>Browser: redirect to /admin/login unless _skipAuthRedirect is set
    Context-->>Guard: setAdmin(null)
  end
```

## Notes

- The current admin auth is context-based, not Redux-based. `login()` stores the admin object in `AdminAuthContext`.
- `AdminAuthContext` bootstraps session state by calling `GET /admin/auth/me` with `_skipAuthRedirect: true` so initial auth checks do not create login redirect loops.
- `AdminRoute` gates access by `loading` and `isAuthenticated`, not by a separate admin Redux slice.
- `adminAxiosInstance` does include refresh retry handling for admin requests via `POST /admin/auth/refresh` before redirecting to `/admin/login`.
- `logout()` clears the context state and also calls `POST /admin/auth/logout`.
