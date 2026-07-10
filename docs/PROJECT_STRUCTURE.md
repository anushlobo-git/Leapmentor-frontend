# Project Structure

This document reflects the repository as it exists today. The descriptions below are derived from the actual files and folders under `src/`.

## `src/`

Top-level application source files and feature folders.

- `App.jsx` - top-level router, auth rehydration, and route composition.
- `index.css` - global styles and Tailwind entry styles.
- `main.jsx` - application bootstrap, store injection, and global error hooks.
- `api/` - thin axios-based helper modules for non-slice API calls.
- `assets/` - static imported assets; currently only `react.svg`.
- `atoms/` - small reusable UI primitives such as buttons, icons, and the logo component.
- `components/` - feature components grouped by admin, auth, mentee, mentor, shared dashboard, and shared UI.
- `config/` - static app configuration such as onboarding field definitions.
- `constants/` - shared constants, HTTP status helpers, navigation items, and image paths.
- `context/` - React context providers, currently admin auth and toast state.
- `hooks/` - reusable stateful logic for API fetching, forms, auth, notifications, and dashboards.
- `mappers/` - response normalization helpers that turn API payloads into stable client shapes.
- `molecules/` - composed UI pieces used by larger landing/auth screens.
- `organisms/` - larger landing-page sections and modal assemblies.
- `pages/` - route-level screens and page shells.
- `store/` - Redux store configuration and feature slices.
- `templates/` - layout wrappers and page-level shells.
- `test/` - Vitest setup and test utilities.
- `ui/` - shared presentational helpers and small reusable UI components.
- `utils/` - axios clients, cookies, logging, session formatting, and validation helpers.

## `src/api/`

API helper modules used outside Redux slices.

- `escrow.api.js` - escrow payment, release, refund, status, and commission-rate helpers.
- `notes.ap.js` - note upload, note listing, private-note listing, and note deletion helpers.
- `privateNotes.api.js` - private note CRUD helpers.

## `src/assets/`

- `react.svg` - currently the only checked-in static asset in this folder.

## `src/atoms/`

Base reusable primitives.

- `Button.jsx`
- `Card.jsx`
- `ChevronIcon.jsx`
- `Dot.jsx`
- `GoogleIcon.jsx`
- `HamburgerIcon.jsx`
- `LetterBall.jsx`
- `LinkedInIcon.jsx`
- `Logo.jsx`
- `SideArrow.jsx`
- `StarIcon.jsx`

These belong here when they are tiny, reusable, and not tied to a single feature flow.

## `src/components/`

Feature and layout components, grouped by domain.

- `FullScreenLoader.jsx` - shared full-screen loading state.
- `LeapBuddy.jsx` - assistant/chat entry point.
- `admin/` - admin dashboard layout, auth guard, and support messages.
- `auth/` - login/register screens, social auth UI, and route guards.
- `common/` - shared page-level utilities such as the Help Center.
- `mentee/` - mentee dashboard, onboarding, profile, and find-mentors flows.
- `mentor/` - mentor dashboard, onboarding, profile, availability, earnings, requests, and verification flows.
- `shared/` - shared dashboard access components.
- `shared-dashboard/` - the shared connect dashboard and its tab set.
- `ui/` - shared low-level UI wrappers and connect card layouts.

### `src/components/admin/`

- `AdminLayout.jsx` - admin shell/sidebar layout.
- `AdminRoute.jsx` - admin auth guard.
- `AdminSupportMessages.jsx` - support inbox UI.
- `common/` - admin dashboard chart/badge helpers.

`src/components/admin/common/` currently contains `MentorIndustryChart.jsx`, `StatCard.jsx`, `StatusBadge.jsx`, and `UserGrowthChart.jsx`.

### `src/components/auth/`

- `AuthIcons.jsx`
- `AuthLeftPanel.jsx`
- `AuthSSOButtons.jsx`
- `AuthUI.jsx`
- `LoginForm.jsx`
- `LoginLeftPanel.jsx`
- `ProtectedRoute.jsx`
- `RegisterForm.jsx`

These files belong here when they participate in the login, registration, and route-access flows.

### `src/components/mentee/`

- `dashboard/` - mentee dashboard views.
- `onboarding/` - mentee onboarding forms and sections.
- `profile/` - mentee profile editing shells.

`src/components/mentee/dashboard/` currently contains `ComingSoon.jsx`, `DashboardLayout.jsx`, `HomeTab.jsx`, `InterestedFieldsCard.jsx`, `MentorshipPrefsCard.jsx`, `ProfessionalDetailsCard.jsx`, `ProfileHeroCard.jsx`, `ProfileTab.jsx`, `SocialPresenceCard.jsx`, `Topbar.jsx`, plus `findMentors/` and `history/`.

`src/components/mentee/dashboard/findMentors/` currently contains `ConnectSucessModal.jsx`, `FilterPanel.jsx`, `FindMentorsTab.jsx`, `MentorCard.jsx`, `MentorCardSkeleton.jsx`, `MentorGrid.jsx`, `MentorProfileModal.jsx`, and `SearchBar.jsx`.

`src/components/mentee/dashboard/history/` currently contains `DetailDrawer.jsx`, `EscrowPaymentModal.jsx`, `EscrowSuccessModal.jsx`, `HistoryTable.jsx`, `RequestHistoryTab.jsx`, `StatusBadge.jsx`, and `constants.js`.

`src/components/mentee/onboarding/` currently contains `InterestedFieldsSection.jsx`, `MenteeOnboardingShell.jsx`, `MentorshipPrefsSection.jsx`, `PersonalInfoSection.jsx`, `ProfessionalDetailsSection.jsx`, and `SocialLinksSection.jsx`.

`src/components/mentee/profile/` currently contains `MenteeEditProfileShell.jsx`.

### `src/components/mentor/`

- `dashboard/` - mentor dashboard views.
- `onboarding/` - mentor onboarding forms and sections.
- `profile/` - mentor profile editing shells.
- `PhoneNumberField.jsx`, `ResumeUpload.jsx`, `VerificationFormShell.jsx`, `VerificationInstructionsModal.jsx`, and `WorkExperienceUpload.jsx` - mentor verification and upload flow components.

`src/components/mentor/dashboard/` currently contains `ComingSoon.jsx`, `DashboardLayout.jsx`, `MentorHomeTab.jsx`, `MentorshipPrefsCard.jsx`, `ProfessionalInfoCard.jsx`, `ProfileCard.jsx`, `ProfileTab.jsx`, `SkillsCard.jsx`, `SocialCard.jsx`, `Topbar.jsx`, plus `availability/`, `earnings/`, and `requests/`.

`src/components/mentor/dashboard/availability/` currently contains `AvailabilityTab.jsx`, `CalendarAvailabilitySection.jsx`, `IntegrationsSection.jsx`, and `TimezoneDurationSection.jsx`.

`src/components/mentor/dashboard/earnings/` currently contains `TrackEarningsTab.jsx`.

`src/components/mentor/dashboard/requests/` currently contains `MenteeProfileModal.jsx`, `ReferModal.jsx`, `ReferredByProfileModal.jsx`, `RequestActionModal.jsx`, `RequestCard.jsx`, and `RequestsTab.jsx`.

`src/components/mentor/onboarding/` currently contains `OnboardingFormShell.jsx`, `PersonalInfoSection.jsx`, `PreferencesSection.jsx`, `ProfessionalInfoSection.jsx`, `SkillsSection.jsx`, and `SocialLinksSection.jsx`.

`src/components/mentor/profile/` currently contains `MentorEditProfileShell.jsx`.

### `src/components/shared/`

- `ConnectsTab.jsx` - shared connect dashboard entry used by the shared dashboard shell.

### `src/components/shared-dashboard/`

- `SharedDashboardLayout.jsx`
- `SharedSidebar.jsx`
- `SharedTopbar.jsx`
- `tabs/` - overview, chat, goals, notes, notifications, and additional-session tabs.

`src/components/shared-dashboard/tabs/` currently contains `AdditionalSessionPaymentModal.jsx`, `FeedbackModal.jsx`, `PrivateNotesTab.jsx`, `ReportModal.jsx`, `ReportSuccessModal.jsx`, `SharedAdditionalSessionTab.jsx`, `SharedChatTab.jsx`, `SharedGoalsTab.jsx`, `SharedHomeTab.jsx`, `SharedNotesTab.jsx`, `SharedNotificationsTab.jsx`, `SharedReportTab.jsx`, plus `goals/` and `utils/`.

`src/components/shared-dashboard/tabs/goals/` currently contains `GoalForm.jsx`, `MilestoneList.jsx`, `SessionCard.jsx`, and `TimelineTracker.jsx`.

`src/components/shared-dashboard/tabs/utils/` currently contains `notesHelpers.js`.

### `src/components/ui/`

- `connects/` - connect card and layout primitives used by connect-related screens.

`src/components/ui/connects/` currently contains `ConnectCard.jsx` and `ConnectsLayout.jsx`.

## `src/config/`

- `onboardingFields.js` - onboarding field definitions used by mentor and mentee shells.

## `src/constants/`

- `httpStatus.js` - shared HTTP status helpers.
- `images.js` - central image-path constants.
- `menteeNavItems.jsx` - mentee nav configuration.
- `mentorNavItems.jsx` - mentor nav configuration.

## `src/context/`

- `AdminAuthContext.jsx` - admin auth state and session bootstrap.
- `ToastContext.jsx` - toast provider wrapper.

## `src/hooks/`

Reusable hooks for fetching data, mutating state, and tying UI to the API.

Current files include `useAvailability.js`, `useChat.js`, `useConnectRequest.js`, `useGoals.js`, `useGoogleAuth.js`, `useMenteeDashboard.jsx`, `useMenteeEditProfile.js`, `useMenteeOnboarding.js`, `useMenteeSettings.js`, `useMentorDashboard.js`, `useMentorEditProfile.js`, `useMentorSearch.js`, `useMentorSettings.js`, `useNotes.js`, `useOngoingConnects.js`, `usePrivateNotes.js`, `usePushNotification.js`, `useReport.js`, `useReportComplaint.js`, `useRequestHistory.js`, `useRespondToRequest.js`, `useSessions.js`, `useSlotLock.js`, `useSocketToast.js`, `useTrackEarnings.js`, and `useUnreadCount.js`.

## `src/mappers/`

Normalization helpers that convert API payloads into stable client objects.

Current files include `connectsMapper.js`, `earningsMapper.js`, `goalsMapper.js`, `menteeMapper.js`, `mentorMapper.js`, `notificationMapper.js`, `reportMapper.js`, `sessionsMapper.js`, `settingsMapper.js`, and `userMapper.js`.

## `src/molecules/`

- `ContactModal.jsx`
- `DotIndicator.jsx`
- `FeatureCard.jsx`
- `HeroSlider.jsx`
- `RegisterDropdownItem.jsx`
- `StarRating.jsx`
- `StatCard.jsx`
- `SuccessCard.jsx`
- `TermsAndConditionsModal.jsx`
- `TestimonialCard.jsx`

These are small composed UI pieces used by landing pages, onboarding, and auth screens.

## `src/organisms/`

- `Footer.jsx`
- `Hero.jsx`
- `Missions.jsx`
- `Navbar.jsx`
- `Testimonials.jsx`

These are larger page sections, mostly for the public landing page.

## `src/pages/`

Route-level screens.

- `ForgotPassword.jsx`
- `LoginMentee.jsx`
- `LoginMentor.jsx`
- `MenteeDashboard.jsx`
- `MenteeOnboarding.jsx`
- `MentorDashboard.jsx`
- `MentorMatchmaking.jsx`
- `MentorOnboarding.jsx`
- `MentorVerification.jsx`
- `NotFound.jsx`
- `Register.jsx`
- `RegisterMentee.jsx`
- `RegisterMentor.jsx`
- `SSOCallback.jsx`
- `SharedDashboardPage.jsx`
- `VerifyEmail.jsx`
- `admin/` - admin entry screens.
- `shared/` - shared landing/home screens.

`src/pages/admin/` currently contains `AdminEngagements.jsx`, `AdminLogin.jsx`, `AdminPayments.jsx`, `AdminReports.jsx`, `AdminSettings.jsx`, `AdminUserManagement.jsx`, `AdminVerifications.jsx`, and `AdminWalletRequests.jsx`.

`src/pages/shared/` currently contains `Home.jsx`.

## `src/store/`

- `index.js` - Redux store composition.
- `slices/` - feature slices for auth, onboarding, shared dashboard state, and dashboard profile state.

`src/store/slices/` currently contains `authSlice.js`, `dashboardUserSlice.js`, `menteeOnboardingSlice.js`, `mentorOnboardingSlice.js`, and `sharedDashboardSlice.js`.

## `src/templates/`

- `PublicLayout.jsx` - public-facing layout wrapper.

## `src/test/`

- `setup.js` - Vitest setup and test environment bootstrap.

## `src/ui/`

- `OnboardingProgressBar.jsx`
- `Testimonials.jsx`
- `ai.jsx`

These are shared UI helpers that sit outside the domain-specific component trees.

## `src/utils/`

Current files include `adminAxiosInstance.js`, `apiResponse.js`, `axiosInstance.js`, `cookies.js`, `httpStatus.js`, `logger.js`, `sessionFormat.js`, and `validation/`.

`src/utils/validation/` currently contains `schemas.js`.
