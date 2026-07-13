/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentor/dashboard/ProfileTab.jsx
// Thin wrapper so existing imports of this path keep working unchanged.
import ProfileTab from "@features/profile/components/ProfileTab";
import { mentorProfileConfig } from "@features/profile/components/profileConfig";

const MentorProfileTab = () => <ProfileTab config={mentorProfileConfig} />;

export default MentorProfileTab;
