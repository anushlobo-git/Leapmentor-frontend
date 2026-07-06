import { z } from "zod";

// Base schemas that can be reused and composed
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least 1 uppercase letter")
  .regex(/[0-9]/, "At least 1 number")
  .regex(/[^A-Za-z0-9]/, "At least 1 special character");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name is too short")
  .max(100, "Name is too long");

// Form-specific schemas composed from base schemas
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Admin settings schemas
export const commissionSchema = z.object({
  commission: z
    .number({ invalid_type_error: "Enter a valid number" })
    .min(0, "Commission must be at least 0")
    .max(100, "Commission must be at most 100"),
});

export const addAdminSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

// File upload validation helpers
const DOCUMENT_TYPES =new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

const IMAGE_TYPES =new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const RESUME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// File validation result type
export const FileValidationResult = z.object({
  valid: z.boolean(),
  error: z.string().optional(),
});

// File validation functions
export const validateDocumentFile = (file) => {
  if (!file) return { valid: false, error: "No file selected" };
  if (!DOCUMENT_TYPES.has(file.type)) {
    return {
      valid: false,
      error:
        "File type not supported. Use PDF, image, Word, PowerPoint, Excel or text.",
    };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File too large. Maximum size is 10MB." };
  }
  return { valid: true };
};

export const validateImageFile = (file, maxSizeMB = 5) => {
  if (!file) return { valid: false, error: "No file selected" };
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Only image files are allowed." };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `Image must be under ${maxSizeMB}MB.` };
  }
  return { valid: true };
};

export const validateScreenshotFile = (file) => {
  if (!file) return { valid: false, error: "No file selected" };
  if (!IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "Only JPG, PNG, or WEBP images are allowed.",
    };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "Screenshot must be under 10MB." };
  }
  return { valid: true };
};

export const validateResumeFile = (file) => {
  if (!file) return { valid: false, error: "No file selected" };
  if (!RESUME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "File type not supported. Please upload: PDF, JPG, PNG, WEBP",
    };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File too large. Maximum size is 10MB." };
  }
  return { valid: true };
};

export const validateWorkExperienceFiles = (files, maxFiles = 3) => {
  if (!files || files.length === 0) return { valid: true };
  if (files.length > maxFiles) {
    return { valid: false, error: `Maximum ${maxFiles} files allowed` };
  }
  for (const file of files) {
    if (!RESUME_TYPES.has(file.type)) {
      return {
        valid: false,
        error: "Only PDF, JPG, PNG, WEBP files are allowed",
      };
    }
    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: false,
        error: "File too large. Maximum size is 10MB per file.",
      };
    }
  }
  return { valid: true };
};

// Zod schemas for form-based file uploads (when file is part of a form object)
export const documentUploadSchema = z.object({
  file: z.custom((file) => {
    const result = validateDocumentFile(file);
    return result.valid;
  }, "Invalid file"),
  title: z.string().optional(),
});

export const imageUploadSchema = z.object({
  file: z.custom((file) => {
    const result = validateImageFile(file);
    return result.valid;
  }, "Invalid image file"),
});

export const screenshotUploadSchema = z.object({
  file: z.custom((file) => {
    const result = validateScreenshotFile(file);
    return result.valid;
  }, "Invalid screenshot file"),
});

export const resumeUploadSchema = z.object({
  file: z.custom((file) => {
    const result = validateResumeFile(file);
    return result.valid;
  }, "Invalid resume file"),
});
