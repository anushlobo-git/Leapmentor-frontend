/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  registerSchema,
  loginSchema,
  commissionSchema,
  addAdminSchema,
  validateDocumentFile,
  validateImageFile,
  validateScreenshotFile,
  validateResumeFile,
  validateWorkExperienceFiles,
  documentUploadSchema,
  imageUploadSchema,
  screenshotUploadSchema,
  resumeUploadSchema,
} from "./schemas";

describe("schemas", () => {
  describe("emailSchema", () => {
    it("should validate valid email", () => {
      const result = emailSchema.safeParse("test@example.com");
      expect(result.success).toBe(true);
    });

    it("should trim whitespace", () => {
      const result = emailSchema.safeParse("  test@example.com  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("test@example.com");
      }
    });

    it("should convert to lowercase", () => {
      const result = emailSchema.safeParse("TEST@EXAMPLE.COM");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("test@example.com");
      }
    });

    it("should reject invalid email", () => {
      const result = emailSchema.safeParse("invalid");
      expect(result.success).toBe(false);
    });

    it("should reject email without @", () => {
      const result = emailSchema.safeParse("testexample.com");
      expect(result.success).toBe(false);
    });

    it("should reject email without domain", () => {
      const result = emailSchema.safeParse("test@");
      expect(result.success).toBe(false);
    });
  });

  describe("passwordSchema", () => {
    it("should validate strong password", () => {
      const result = passwordSchema.safeParse("Abcdefgh1!");
      expect(result.success).toBe(true);
    });

    it("should reject password less than 8 characters", () => {
      const result = passwordSchema.safeParse("Abc1!");
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase", () => {
      const result = passwordSchema.safeParse("abcdefgh1!");
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const result = passwordSchema.safeParse("Abcdefgh!");
      expect(result.success).toBe(false);
    });

    it("should reject password without special character", () => {
      const result = passwordSchema.safeParse("Abcdefgh1");
      expect(result.success).toBe(false);
    });
  });

  describe("nameSchema", () => {
    it("should validate valid name", () => {
      const result = nameSchema.safeParse("John Doe");
      expect(result.success).toBe(true);
    });

    it("should trim whitespace", () => {
      const result = nameSchema.safeParse("  John Doe  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("John Doe");
      }
    });

    it("should reject name less than 2 characters", () => {
      const result = nameSchema.safeParse("J");
      expect(result.success).toBe(false);
    });

    it("should reject name more than 100 characters", () => {
      const result = nameSchema.safeParse("A".repeat(101));
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate valid registration data", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "Abcdefgh1!",
        confirmPassword: "Abcdefgh1!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "Abcdefgh1!",
        confirmPassword: "Different1!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid name", () => {
      const result = registerSchema.safeParse({
        name: "J",
        email: "test@example.com",
        password: "Abcdefgh1!",
        confirmPassword: "Abcdefgh1!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "invalid",
        password: "Abcdefgh1!",
        confirmPassword: "Abcdefgh1!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid password", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "test@example.com",
        password: "weak",
        confirmPassword: "weak",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should validate valid login data", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "anypassword",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid",
        password: "password",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("commissionSchema", () => {
    it("should validate valid commission", () => {
      const result = commissionSchema.safeParse({ commission: 10 });
      expect(result.success).toBe(true);
    });

    it("should reject negative commission", () => {
      const result = commissionSchema.safeParse({ commission: -1 });
      expect(result.success).toBe(false);
    });

    it("should reject commission over 100", () => {
      const result = commissionSchema.safeParse({ commission: 101 });
      expect(result.success).toBe(false);
    });

    it("should accept 0 commission", () => {
      const result = commissionSchema.safeParse({ commission: 0 });
      expect(result.success).toBe(true);
    });

    it("should accept 100 commission", () => {
      const result = commissionSchema.safeParse({ commission: 100 });
      expect(result.success).toBe(true);
    });

    it("should reject non-number", () => {
      const result = commissionSchema.safeParse({ commission: "10" });
      expect(result.success).toBe(false);
    });
  });

  describe("addAdminSchema", () => {
    it("should validate valid admin data", () => {
      const result = addAdminSchema.safeParse({
        name: "Admin User",
        email: "admin@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid name", () => {
      const result = addAdminSchema.safeParse({
        name: "A",
        email: "admin@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = addAdminSchema.safeParse({
        name: "Admin User",
        email: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validateDocumentFile", () => {
    it("should reject null file", () => {
      const result = validateDocumentFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("No file selected");
    });

    it("should reject undefined file", () => {
      const result = validateDocumentFile(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("No file selected");
    });

    it("should accept PDF", () => {
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = validateDocumentFile(file);
      expect(result.valid).toBe(true);
    });

    it("should accept JPEG", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = validateDocumentFile(file);
      expect(result.valid).toBe(true);
    });

    it("should accept PNG", () => {
      const file = new File(["test"], "test.png", { type: "image/png" });
      const result = validateDocumentFile(file);
      expect(result.valid).toBe(true);
    });

    it("should reject unsupported file type", () => {
      const file = new File(["test"], "test.exe", { type: "application/x-msdownload" });
      const result = validateDocumentFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("File type not supported");
    });

    it("should reject file over 10MB", () => {
      const file = new File(["x".repeat(11 * 1024 * 1024)], "test.pdf", { type: "application/pdf" });
      const result = validateDocumentFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("File too large");
    });
  });

  describe("validateImageFile", () => {
    it("should reject null file", () => {
      const result = validateImageFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("No file selected");
    });

    it("should accept JPEG", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it("should accept PNG", () => {
      const file = new File(["test"], "test.png", { type: "image/png" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it("should reject non-image file", () => {
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Only image files");
    });

    it("should reject file over default 5MB", () => {
      const file = new File(["x".repeat(6 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("5MB");
    });

    it("should respect custom max size", () => {
      const file = new File(["x".repeat(6 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
      const result = validateImageFile(file, 10);
      expect(result.valid).toBe(true);
    });
  });

  describe("validateScreenshotFile", () => {
    it("should reject null file", () => {
      const result = validateScreenshotFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("No file selected");
    });

    it("should accept JPEG", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = validateScreenshotFile(file);
      expect(result.valid).toBe(true);
    });

    it("should accept PNG", () => {
      const file = new File(["test"], "test.png", { type: "image/png" });
      const result = validateScreenshotFile(file);
      expect(result.valid).toBe(true);
    });

    it("should accept WEBP", () => {
      const file = new File(["test"], "test.webp", { type: "image/webp" });
      const result = validateScreenshotFile(file);
      expect(result.valid).toBe(true);
    });

    it("should reject GIF", () => {
      const file = new File(["test"], "test.gif", { type: "image/gif" });
      const result = validateScreenshotFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("JPG, PNG, or WEBP");
    });

    it("should reject file over 10MB", () => {
      const file = new File(["x".repeat(11 * 1024 * 1024)], "test.jpg", { type: "image/jpeg" });
      const result = validateScreenshotFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("10MB");
    });
  });

  describe("validateResumeFile", () => {
    it("should reject null file", () => {
      const result = validateResumeFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("No file selected");
    });

    it("should accept PDF", () => {
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = validateResumeFile(file);
      expect(result.valid).toBe(true);
    });

    it("should accept JPEG", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = validateResumeFile(file);
      expect(result.valid).toBe(true);
    });

    it("should reject Word document", () => {
      const file = new File(["test"], "test.doc", { type: "application/msword" });
      const result = validateResumeFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("PDF, JPG, PNG, WEBP");
    });

    it("should reject file over 10MB", () => {
      const file = new File(["x".repeat(11 * 1024 * 1024)], "test.pdf", { type: "application/pdf" });
      const result = validateResumeFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("10MB");
    });
  });

  describe("validateWorkExperienceFiles", () => {
    it("should accept null or empty array", () => {
      expect(validateWorkExperienceFiles(null).valid).toBe(true);
      expect(validateWorkExperienceFiles([]).valid).toBe(true);
    });

    it("should accept valid files", () => {
      const files = [
        new File(["test"], "test1.pdf", { type: "application/pdf" }),
        new File(["test"], "test2.jpg", { type: "image/jpeg" }),
      ];
      const result = validateWorkExperienceFiles(files);
      expect(result.valid).toBe(true);
    });

    it("should reject more than max files", () => {
      const files = [
        new File(["test"], "test1.pdf", { type: "application/pdf" }),
        new File(["test"], "test2.pdf", { type: "application/pdf" }),
        new File(["test"], "test3.pdf", { type: "application/pdf" }),
        new File(["test"], "test4.pdf", { type: "application/pdf" }),
      ];
      const result = validateWorkExperienceFiles(files, 3);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Maximum 3 files");
    });

    it("should reject invalid file type", () => {
      const files = [
        new File(["test"], "test.doc", { type: "application/msword" }),
      ];
      const result = validateWorkExperienceFiles(files);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("PDF, JPG, PNG, WEBP");
    });

    it("should reject file over 10MB", () => {
      const files = [
        new File(["x".repeat(11 * 1024 * 1024)], "test.pdf", { type: "application/pdf" }),
      ];
      const result = validateWorkExperienceFiles(files);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("10MB");
    });

    it("should respect custom max files", () => {
      const files = [
        new File(["test"], "test1.pdf", { type: "application/pdf" }),
        new File(["test"], "test2.pdf", { type: "application/pdf" }),
      ];
      const result = validateWorkExperienceFiles(files, 5);
      expect(result.valid).toBe(true);
    });
  });

  describe("documentUploadSchema", () => {
    it("should validate valid document", () => {
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = documentUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it("should reject invalid document", () => {
      const file = new File(["test"], "test.exe", { type: "application/x-msdownload" });
      const result = documentUploadSchema.safeParse({ file });
      expect(result.success).toBe(false);
    });
  });

  describe("imageUploadSchema", () => {
    it("should validate valid image", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = imageUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it("should reject invalid image", () => {
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = imageUploadSchema.safeParse({ file });
      expect(result.success).toBe(false);
    });
  });

  describe("screenshotUploadSchema", () => {
    it("should validate valid screenshot", () => {
      const file = new File(["test"], "test.png", { type: "image/png" });
      const result = screenshotUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it("should reject invalid screenshot", () => {
      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = screenshotUploadSchema.safeParse({ file });
      expect(result.success).toBe(false);
    });
  });

  describe("resumeUploadSchema", () => {
    it("should validate valid resume", () => {
      const file = new File(["test"], "resume.pdf", { type: "application/pdf" });
      const result = resumeUploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it("should reject invalid resume", () => {
      const file = new File(["test"], "resume.doc", { type: "application/msword" });
      const result = resumeUploadSchema.safeParse({ file });
      expect(result.success).toBe(false);
    });
  });
});
