/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentee/dashboard/ProfileTab.jsx
// Thin wrapper so existing imports of this path keep working unchanged.
import ProfileTab from "@features/profile/components/ProfileTab";
import { menteeProfileConfig } from "@features/profile/components/profileConfig";

function MenteeProfileTab() {
  return <ProfileTab config={menteeProfileConfig} />;
}

export default MenteeProfileTab;
