/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/mentor/dashboard/ProfileTab.jsx
// Thin wrapper so existing imports of this path keep working unchanged.
import ProfileTab from "@features/profile/views/ProfileTab";
import { mentorProfileConfig } from "@features/profile/views/profileConfig";
interface MentorProfileTabProps {
  config?: Record<string, any>;
  [key: string]: any;
}

const MentorProfileTab = ({ config, ...rest }: MentorProfileTabProps) => (
  <ProfileTab config={config ?? mentorProfileConfig} {...rest} />
);

export default MentorProfileTab;
