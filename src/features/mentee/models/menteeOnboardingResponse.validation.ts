/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import type { MenteeOnboardingResponse } from "./mentee.types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Runtime validation for the success response. TypeScript types disappear at
 * runtime, so this check is what prevents a 2xx response with no profile ID
 * from being treated as a successful onboarding operation.
 */
export const assertMenteeOnboardingResponse = (
  value: unknown,
): MenteeOnboardingResponse => {
  const profile = isRecord(value) && isRecord(value.profile) ? value.profile : null;
  const requiredStringFields = [
    "_id",
    "currentRole",
    "industry",
    "yearsOfExperience",
    "bio",
    "createdAt",
    "updatedAt",
  ];
  const optionalStringFields = [
    "profilePicture",
    "profilePictureFileName",
    "company",
    "linkedInUrl",
    "portfolioUrl",
  ];
  const requiredArrayFields = [
    "skills",
    "interestedFields",
    "communicationPreferences",
    "languages",
  ];
  const requiredBooleanFields = [
    "isProfileComplete",
    "isProfilePublished",
    "emailNotifications",
    "marketingPreferences",
  ];

  if (
    !isRecord(value) ||
    value.success !== true ||
    typeof value.message !== "string" ||
    !profile ||
    requiredStringFields.some(
      (field) => typeof profile[field] !== "string" || profile[field] === "",
    ) ||
    optionalStringFields.some((field) => typeof profile[field] !== "string") ||
    requiredArrayFields.some((field) => !Array.isArray(profile[field])) ||
    requiredBooleanFields.some((field) => typeof profile[field] !== "boolean") ||
    !(typeof profile.user === "string" || isRecord(profile.user))
  ) {
    throw new Error(
      "Mentee onboarding response is missing required created profile data.",
    );
  }

  return value as unknown as MenteeOnboardingResponse;
};
