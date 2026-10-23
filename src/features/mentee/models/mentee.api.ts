/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentee/api/mentee.api.js
import axiosInstance from "@lib/http/axiosInstance";
import type { AxiosProgressEvent, AxiosResponse } from "axios";
import type {
  MenteeOnboardingRequest,
  MenteeOnboardingResponse,
  MenteeProfileApiRecord,
} from "./mentee.types";

// --- onboarding profile creation ---

/**  Promise<AxiosResponse<MenteeOnboardingResponse>>
 * {
  data: {
    message: "Onboarding completed",
    userId: "12345",
    isCompleted: true
  },
  status: 200,
  statusText: "OK",
  headers: {},
  config: {}
}
  this object is wrapped in a Promise because axiosInstance.post returns a Promise that resolves to an AxiosResponse.
 */

export const createMenteeProfile = (
  payload: MenteeOnboardingRequest,
): Promise<AxiosResponse<MenteeOnboardingResponse>> =>
  //Important: <MenteeOnboardingResponse> here is not the request body you're sending.
  // It tells Axios/TypeScript the type of the response data.
  /*Axios therefore understands:
    response.data is of type MenteeOnboardingResponse
  */
  axiosInstance.post<MenteeOnboardingResponse>("/mentee-profile", payload);

// --- onboarding ---
export const uploadProfilePicture = (
  formData: FormData,
  onUploadProgress?: (event: AxiosProgressEvent) => void,
) =>
  axiosInstance.post(`/upload/profile-picture`, formData, { onUploadProgress });

// --- request history / invoices ---
export const downloadInvoice = (requestId: string) =>
  axiosInstance.get(`/invoices/${requestId}`, { responseType: "blob" });

// --- home tab ---
export const searchMentorsBySkill = (skillTerm: string, limit = 4) =>
  axiosInstance.get(`/mentors/search`, { params: { skill: skillTerm, limit } });

export const getMyConnectRequests = () => axiosInstance.get(`/connect-requests/my-requests`);

export const getEscrowWallet = () => axiosInstance.get(`/escrow/wallet`);

export const getMyLeapRequest = () => axiosInstance.get(`/leap-requests/my-request`);

export const createLeapRequest = (reason: string) =>
  axiosInstance.post(`/leap-requests`, { reason });

// --- find mentors / availability ---
export const getMentorAvailability = (mentorUserId: string, duration: number) =>
  axiosInstance.get(`/availability/${mentorUserId}/slots?duration=${duration}`);

export const searchMentorsRequest = (queryString: string) =>
  axiosInstance.get(`/mentors/search?${queryString}`);

// --- current user / mentee profile ---
export const getCurrentUser = () => axiosInstance.get("/users/me");

export const getMenteeProfile = () =>
  axiosInstance.get<MenteeProfileApiRecord>("/mentee-profile/me");

export const updateMenteeProfile = (payload: unknown) =>
  axiosInstance.put("/mentee-profile/me", payload);

export const changePasswordRequest = ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) =>
  axiosInstance.put("/auth/change-password", { currentPassword, newPassword });

// --- request history ---
export const deleteConnectRequest = (id: string) =>
  axiosInstance.delete(`/connect-requests/${id}`);

/*
response.data
is already:
{
  success: true,
  profile: { ... },
  message: "Mentee profile created successfully"
}
this is received by the thunk and action is created for fulfilled state. and the state is updated with the profile data.


*/
