/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentor/dashboard/ProfileTab.jsx
// Thin wrapper so existing imports of this path keep working unchanged.
import type React from "react";
import ProfileTab from "@features/profile/views/ProfileTab";
import { mentorProfileConfig } from "@features/profile/views/profileConfig";

// Only `config` is meaningful here; it is forwarded to the shared ProfileTab.
type MentorProfileTabProps = Partial<React.ComponentProps<typeof ProfileTab>>;

const MentorProfileTab = ({ config, ...rest }: MentorProfileTabProps) => (
  <ProfileTab config={config ?? mentorProfileConfig} {...rest} />
);

export default MentorProfileTab;
