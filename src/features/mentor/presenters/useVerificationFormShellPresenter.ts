/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVerificationDocuments } from "@features/mentor/models/mentor.api";

export const useVerificationFormShellPresenter = () => {
  const navigate = useNavigate();

  // ── Form state ──
  const [phoneNumber,          setPhoneNumber]          = useState("");
  const [resumeFile,           setResumeFile]           = useState<File | null>(null);
  const [workExperienceFiles,  setWorkExperienceFiles]  = useState<File[]>([]);
  const [redirecting, setRedirecting] = useState(false);
  const [showModal, setShowModal] = useState(true);

  // ── Error state — per field ──
  const [errors, setErrors] = useState({
    phoneNumber:         "",
    resumeFile:          "",
    workExperienceFiles: "",
  });

  // ── Submission state ──
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg,     setMsg]     = useState<{ type: string; text: string }>({ type: "", text: "" });

  // ── Handlers ──
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: "" }));
  };

  const handleResumeChange = (file: File | null, error: string | null) => {
    setResumeFile(file);
    setErrors((prev) => ({ ...prev, resumeFile: error || "" }));
  };

  const handleWorkExpChange = (files: File[], error: string | null) => {
    setWorkExperienceFiles(files);
    setErrors((prev) => ({ ...prev, workExperienceFiles: error || "" }));
  };

  const closeModal = () => setShowModal(false);

  // ── Validation ──
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!phoneNumber.trim())  newErrors.phoneNumber = "Phone number is required";
    if (!resumeFile)          newErrors.resumeFile  = "Resume is required";
    return newErrors;
  };

  // ── Submit ──
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrors }));
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber.trim());
      formData.append("resume", resumeFile);
      workExperienceFiles.forEach((file: File) => {
        formData.append("workExperienceDocs", file);
      });

      await uploadVerificationDocuments(formData, (e: { loaded: number; total?: number }) => {
        if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
      });

      setRedirecting(true);
      setTimeout(() => navigate("/dashboard/mentor"), 1500);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to submit documents. Please try again.",
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return {
    phoneNumber,
    resumeFile,
    workExperienceFiles,
    redirecting,
    showModal,
    errors,
    loading,
    progress,
    msg,
    handlePhoneChange,
    handleResumeChange,
    handleWorkExpChange,
    closeModal,
    handleSubmit,
  };
};
