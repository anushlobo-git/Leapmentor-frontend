/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Data contracts only. Request mapping and runtime response validation live
// in their own modules so this file has one responsibility: describing shapes.

/**
 * The complete client-side shape held while the mentee onboarding form is
 * being edited. The form initializes every field, including optional fields,
 * so the request serializer can send one predictable payload shape.
 */
export interface MenteeOnboardingForm {
  profilePicture: string;
  profilePictureFileName: string;
  bio: string;
  currentRole: string;
  company: string;
  industry: string;
  yearsOfExperience: string;
  interestedFields: string[];
  skills: string[];
  communicationPreferences: string[];
  languages: string[];
  linkedInUrl: string;
  portfolioUrl: string;
}

/**
 * Exact payload emitted by the frontend for POST /mentee-profile.
 *
 * The backend validator only requires a subset of these keys, but the
 * onboarding form always sends all of them. Keeping the emitted payload
 * concrete prevents a field from silently disappearing during serialization.
 *
 * This line exists in mentee.types.ts:
export type MenteeOnboardingRequest = MenteeOnboardingForm;
This is a type alias.
It tells TypeScript:
The request body has the same structure as the onboarding form.
It does not create or transform an object.
It also does not execute.
It is used here during compile-time checking:

 */
export type MenteeOnboardingRequest = MenteeOnboardingForm;

export interface MenteeProfileApiUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  isEmailVerified?: boolean;
}

/** The DTO returned by the backend mentee-profile mapper. */
export interface MenteeProfileApiRecord {
  _id: string;
  user: MenteeProfileApiUser | string;
  currentRole: string;
  industry: string;
  company: string;
  yearsOfExperience: string;
  bio: string;
  profilePicture: string;
  profilePictureFileName: string;
  linkedInUrl: string;
  portfolioUrl: string;
  skills: string[];
  interestedFields: string[];
  communicationPreferences: string[];
  languages: string[];
  isProfileComplete: boolean;
  isProfilePublished: boolean;
  emailNotifications: boolean;
  marketingPreferences: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MappedMenteeProfile {
  _id: string | null;
  user: {
    _id: string | null;
    name: string;
    email: string;
    isEmailVerified: boolean;
  };
  profilePicture: string | null;
  profilePictureFileName: string | null;
  bio: string;
  currentRole: string;
  company: string;
  industry: string;
  yearsOfExperience: string | null;
  skills: string[];
  interestedFields: string[];
  communicationPreferences: string[];
  languages: string[];
  linkedInUrl: string | null;
  portfolioUrl: string | null;
  phoneNumber: string | null;
  isProfilePublished: boolean;
  emailNotifications: boolean;
  marketingPreferences: boolean;
  isProfileComplete: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Shape after axiosInstance unwraps the backend envelope:
 *
 * { success, data: { profile }, message }
 *       becomes
 * { success, profile, message }
 */
export interface MenteeOnboardingResponse {
  success: true;
  profile: MenteeProfileApiRecord;
  message: string;
}
