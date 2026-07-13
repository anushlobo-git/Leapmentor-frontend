
# Project Structure

This document reflects the repository as of the feature-based restructure. The old structure mixed Atomic Design (`atoms/molecules/organisms/templates`) with feature folders (`components/mentee`, `components/mentor`, etc.), which meant a "component" could live in five different places. Everything below is organized by **business domain first** (`features/`), with a small, deliberately generic `components/` reserved for pieces that carry no business logic.

## `src/`

- `main.jsx` - application bootstrap, store injection, global error hooks.
- `index.css` - global styles and Tailwind entry styles.
- `app/` - app shell: router, providers, top-level pages that don't belong to a feature.
- `features/` - one folder per business domain. This is where most code lives now.
- `components/` - generic, reusable, business-logic-free UI and layout chrome.
- `lib/` - infrastructure: axios clients, logger, cookies, validation schemas, generic mappers.
- `store/` - root Redux store composition only (`index.js`). Feature slices live inside their feature.
- `config/` - static app configuration shared across features (onboarding field definitions).
- `constants/` - global constants not tied to one feature (image paths).
- `test/` - Vitest setup.

## `src/app/`

- `App.jsx` - top-level router, auth rehydration, route composition.
- `providers/ToastContext.jsx` - toast provider wrapper.
- `pages/NotFound.jsx` - catch-all 404 page.

## `src/features/`

Each feature folder groups everything about one business domain: components, hooks, api calls, redux slice, mappers, and route-level pages. Not every feature has every subfolder — only what that domain actually needs.

### `features/auth/`
Login, registration, password reset, SSO, and route guarding.
- `components/` - `LoginForm.jsx`, `RegisterForm.jsx`, `AuthSSOButtons.jsx`, `AuthUI.jsx`, `AuthIcons.jsx`, `AuthLeftPanel.jsx`, `LoginLeftPanel.jsx`, `ProtectedRoute.jsx`, `RegisterDropdownItem.jsx`.
- `hooks/useGoogleAuth.js`
- `api/auth.api.js` - `login`, `exchangeLinkedInToken`, `logoutRequest`.
- `store/authSlice.js` - `registerUser`, `loginUser`, `sendOtp`, `verifyEmail`, `verifyMagicLink`, `forgotPassword`, `verifyResetOtp`, `resetPassword` thunks.
- `pages/` - `LoginMentee.jsx`, `LoginMentor.jsx`, `Register.jsx`, `RegisterMentee.jsx`, `RegisterMentor.jsx`, `ForgotPassword.jsx`, `VerifyEmail.jsx`, `SSOCallback.jsx`.

### `features/mentee/`
Mentee dashboard, onboarding, profile, and mentor discovery.
- `components/dashboard/` - `HomeTab.jsx`, `ProfileTab.jsx`, `ComingSoon.jsx`, `DashboardLayout.jsx`, plus `findMentors/` (mentor search, filters, profile modal, connect flow) and `history/` (request history, escrow payment/success modals, invoice download).
- `components/onboarding/` - `MenteeOnboardingShell.jsx`, `PersonalInfoSection.jsx`, `ProfessionalDetailsSection.jsx`, `InterestedFieldsSection.jsx`, `MentorshipPrefsSection.jsx`, `SocialLinksSection.jsx`.
- `components/profile/MenteeEditProfileShell.jsx`
- `hooks/` - `useMenteeDashboard.jsx`, `useMenteeOnboarding.js`, `useMenteeEditProfile.js`, `useMenteeSettings.js`, `useMentorSearch.js`, `useRequestHistory.js`.
- `api/mentee.api.js` - profile picture upload, mentor search, connect requests, escrow wallet, leap requests, mentor availability lookup. (Previously these were called with raw `axiosInstance` directly inside `HomeTab.jsx`, `MentorProfileModal.jsx`, `DetailDrawer.jsx`, and `onboarding/PersonalInfoSection.jsx` — now colocated here.)
- `mappers/menteeMapper.js`
- `store/menteeOnboardingSlice.js` - `submitMenteeOnboarding` thunk (`POST /mentee-profile`).
- `constants/menteeNavItems.jsx`
- `pages/MenteeDashboard.jsx`, `pages/MenteeOnboarding.jsx`

### `features/mentor/`
Mentor dashboard, onboarding, verification, availability, and earnings.
- `components/` - `PhoneNumberField.jsx`, `ResumeUpload.jsx`, `WorkExperienceUpload.jsx`, `VerificationFormShell.jsx`, `VerificationInstructionsModal.jsx`, plus `dashboard/` (home tab, profile tab, `availability/`, `earnings/`, `requests/`) and `onboarding/`, `profile/`.
- `hooks/` - `useAvailability.js`, `useMentorDashboard.js`, `useMentorEditProfile.js`, `useMentorSettings.js`, `useRespondToRequest.js`, `useTrackEarnings.js`.
- `api/mentor.api.js` - verification document upload, profile picture upload, incoming requests, respond/refer to a request, mentor earnings, Google Calendar auth/disconnect/busy/events. (Previously called directly from `VerificationFormShell.jsx`, `onboarding/PersonalInfoSection.jsx`, `requests/ReferModal.jsx`, `requests/MenteeProfileModal.jsx`, `requests/RequestsTab.jsx`, `MentorHomeTab.jsx`, `availability/IntegrationsSection.jsx`, `availability/CalendarAvailabilitySection.jsx`.)
- `mappers/mentorMapper.js`, `mappers/earningsMapper.js`
- `store/mentorOnboardingSlice.js` - `submitMentorOnboarding` thunk (`POST /mentor-profile`).
- `constants/mentorNavItems.jsx`
- `pages/MentorDashboard.jsx`, `pages/MentorOnboarding.jsx`, `pages/MentorVerification.jsx`, `pages/MentorMatchmaking.jsx` (currently unrouted in `App.jsx` — likely dead code, worth confirming and removing).

### `features/admin/`
Admin shell, auth, and every admin management screen.
- `components/` - `AdminLayout.jsx`, `AdminRoute.jsx`, `AdminSupportMessages.jsx`, `common/` (chart/badge helpers).
- `context/AdminAuthContext.jsx` - admin session state (React context, not Redux — see Auth State Architecture in ONBOARDING.md).
- `api/admin.api.js` - every admin HTTP call, one named export per endpoint: login/logout, pending-count badge, support messages, mentor verifications, reports (stats/list/update/refund/delete-session), payments (stats/chart/transactions), engagements, leap requests (list/approve/reject), users (stats/growth/industries/list/delete/block/unblock), settings (commission get/update, add-admin). All 10 admin pages previously called `adminAxiosInstance` inline; they now all import from this one file.
- `pages/` - `AdminLogin.jsx`, `AdminEngagements.jsx`, `AdminPayments.jsx`, `AdminReports.jsx`, `AdminSettings.jsx`, `AdminUserManagement.jsx`, `AdminVerifications.jsx`, `AdminWalletRequests.jsx`.

### `features/connects/`
An active mentor–mentee engagement (the pairing formed once a mentor accepts and escrow is paid).
- `components/` - `ConnectsTab.jsx`, `ConnectCard.jsx`, `ConnectsLayout.jsx`.
- `hooks/useConnectRequest.js`, `hooks/useOngoingConnects.js`
- `api/escrow.api.js` - `payEscrow`, `releaseEscrow`, `refundEscrow`, `getEscrowStatus`, `payAdditionalEscrow`, `getPlatformCommissionRate`.
- `mappers/connectsMapper.js`

### `features/sessions/`
Individual mentoring session slots within a connect.
- `components/SessionCard.jsx`, `components/SessionSkeleton.jsx`
- `hooks/useSessions.js`, `hooks/useSlotLock.js`
- `api/sessions.api.js` - `getMentorAvailabilityForConnect` (previously called inline from `goals/SessionCard.jsx` and `SharedAdditionalSessionTab.jsx`).
- `mappers/sessionsMapper.js`
- `utils/sessionFormat.js`

### `features/goals/`
Mentorship goal-tracking inside the shared dashboard.
- `components/` - `GoalForm.jsx`, `MilestoneList.jsx`, `SessionCard.jsx`, `TimelineTracker.jsx`.
- `hooks/useGoals.js`
- `mappers/goalsMapper.js`

### `features/notes/`
Shared and private notes attached to a connect.
- `hooks/useNotes.js`, `hooks/usePrivateNotes.js`
- `api/notes.api.js` (renamed from the old `notes.ap.js` typo), `api/privateNotes.api.js`
- `utils/notesHelpers.js`

### `features/notifications/`
- `hooks/useSocketToast.js`, `hooks/useUnreadCount.js`, `hooks/usePushNotification.js`
- `api/notifications.api.js` - `getNotifications`, `markAllNotificationsRead`, `clearAllNotifications`, `markNotificationRead`, `deleteNotification` (previously inline in `SharedNotificationsTab.jsx`).
- `mappers/notificationMapper.js`

### `features/reports/`
- `hooks/useReport.js`, `hooks/useReportComplaint.js`
- `mappers/reportMapper.js`

### `features/profile/`
Cross-role "edit profile" tab chrome shared by mentee and mentor dashboards.
- `components/ProfileTab.jsx`, `components/profileConfig.js`
- `mappers/settingsMapper.js` (shared by `useMenteeSettings` and `useMentorSettings`)
- `store/dashboardUserSlice.js` - `refetchMentorProfile` thunk (`GET /mentor-profile/me`).

### `features/shared-dashboard/`
The per-connect shared workspace both mentee and mentor land in once paired.
- `components/` - `SharedDashboardLayout.jsx`, `SharedSidebar.jsx`, `SharedTopbar.jsx`, `tabs/` (home, chat, goals, notes, notifications, reports, additional-session, plus their modals).
- `hooks/useChat.js`
- `api/shared-dashboard.api.js` - `getConnectDetail` (previously called inline from both `SharedGoalsTab.jsx` and `SharedDashboardPage.jsx`).
- `store/sharedDashboardSlice.js`
- `pages/SharedDashboardPage.jsx`

### `features/support/`
Help Center FAQ widget and the LeapBuddy AI chat assistant.
- `components/HelpCenter.jsx`, `components/LeapBuddy.jsx`, `components/AiWidgetIcons.jsx`
- `api/support.api.js` - `sendSupportMessage`, `sendAiChatMessage` (previously inline in both `HelpCenter.jsx` and `LeapBuddy.jsx`).

### `features/marketing/`
Public landing page sections.
- `components/Hero.jsx`, `Missions.jsx`, `Testimonials.jsx`, `TestimonialsWidget.jsx`, `TestimonialCard.jsx`, `FeatureCard.jsx`, `HeroSlider.jsx`
- `pages/Home.jsx`

## `src/components/`
Generic, reusable, **no business logic**. If it needs an api call, a redux slice, or knows what a "mentee" is, it belongs in `features/`, not here.

- `ui/` - `Button.jsx`, `Card.jsx`, `Dot.jsx`, `Logo.jsx`, icons, `ContactModal.jsx`, `DotIndicator.jsx`, `StarRating.jsx`, `StatCard.jsx`, `SuccessCard.jsx`, `TermsAndConditionsModal.jsx`, `OnboardingProgressBar.jsx` — this folder is the merged replacement for the old `atoms/`, `molecules/`, `ui/`, and `components/ui/`.
- `layout/` - `Navbar.jsx`, `Footer.jsx`, `PublicLayout.jsx`, `DashboardShell.jsx`, `DashboardSidebar.jsx`, `DashboardTopbar.jsx`, `Sidebar.jsx` — dashboard/site chrome shared by mentee and mentor, not specific to either.
- `common/` - `FullScreenLoader.jsx`, `EmptyState.jsx`, `ErrorBoundary.jsx`.

## `src/lib/`
Infrastructure, not business logic.
- `axiosInstance.js` - authenticated axios client with refresh-token retry.
- `adminAxiosInstance.js` - separate axios client for admin session cookies.
- `apiResponse.js`, `cookies.js`, `logger.js`, `httpStatus.js`
- `mappers/userMapper.js` - generic user-shape mapper shared by `authSlice` and `dashboardUserSlice`.
- `validation/schemas.js`

## `src/store/`
- `index.js` - Redux store composition only. Every feature slice above is combined here; no slice logic lives in this folder anymore.

## `src/config/`
- `onboardingFields.js` - onboarding field definitions shared by both mentee and mentor onboarding.

## `src/constants/`
- `images.js` - central image-path constants.

## `src/test/`
- `setup.js` - Vitest setup and test environment bootstrap.

## Why this shape

- **Colocation.** Fixing a bug in mentor onboarding means everything you need — component, hook, api call, slice, mapper — is in one folder, not spread across five top-level ones.
- **Deletability.** Dropping a feature means deleting one folder, not hunting through `hooks/`, `api/`, `store/slices/`, and `mappers/` separately.
- **One place for "generic UI."** `components/ui/` replaces the old five-way split across `atoms/`, `molecules/`, `organisms/`, `ui/`, and `components/ui/`.
- **Every API call has a name.** No component reaches for `axiosInstance` directly anymore — each domain has one `api/*.api.js` file with named functions, so grepping for an endpoint always lands you in the right feature.
