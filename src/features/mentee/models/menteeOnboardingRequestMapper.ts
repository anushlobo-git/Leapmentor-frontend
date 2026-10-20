/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import type { MenteeOnboardingForm, MenteeOnboardingRequest } from "./mentee.types";

/**
 * Converts form state into the request body. This is an outbound mapper: it
 * deliberately selects the API fields instead of spreading arbitrary form
 * state into a request.
 *
 * After all client-side validations pass, this line executes:
dispatch(
  submitMenteeOnboarding(
    toMenteeOnboardingRequest(form)
  )
);
The function toMenteeOnboardingRequest is in menteeOnboardingRequestMapper.ts:

 */
export const toMenteeOnboardingRequest = (
  form: MenteeOnboardingForm,
): MenteeOnboardingRequest => ({
  profilePicture: form.profilePicture,
  profilePictureFileName: form.profilePictureFileName,
  bio: form.bio,
  currentRole: form.currentRole,
  company: form.company,
  industry: form.industry,
  yearsOfExperience: form.yearsOfExperience,
  interestedFields: form.interestedFields,
  skills: form.skills,
  communicationPreferences: form.communicationPreferences,
  languages: form.languages,
  linkedInUrl: form.linkedInUrl,
  portfolioUrl: form.portfolioUrl,
});
