/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentor/dashboard/ProfileTab.jsx
// Thin wrapper so existing imports of this path keep working unchanged.
import ProfileTab from "@components/shared/profile/ProfileTab";
import { mentorProfileConfig } from "@components/shared/profile/profileConfig";

export default () => <ProfileTab config={mentorProfileConfig} />;
