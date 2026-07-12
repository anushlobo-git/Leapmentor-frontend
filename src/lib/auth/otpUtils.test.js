/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  getOtpString,
  resetOtp,
  getOtpInputClasses,
} from "./otpUtils";

describe("otpUtils", () => {
  let mockSetOtpArray;
  let otpArray;

  beforeEach(() => {
    mockSetOtpArray = vi.fn();
    otpArray = ["", "", "", "", "", ""];
  });

  describe("handleOtpChange", () => {
    it("should allow single digit input", () => {
      handleOtpChange("5", 0, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).toHaveBeenCalledWith(["5", "", "", "", "", ""]);
    });

    it("should allow empty input", () => {
      otpArray[0] = "5";
      handleOtpChange("", 0, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).toHaveBeenCalledWith(["", "", "", "", "", ""]);
    });

    it("should reject non-digit input", () => {
      handleOtpChange("a", 0, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).not.toHaveBeenCalled();
    });

    it("should reject multiple digits", () => {
      handleOtpChange("12", 0, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).not.toHaveBeenCalled();
    });

    it("should focus next input when value is entered and not at last index", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });

      handleOtpChange("5", 0, otpArray, mockSetOtpArray);
      expect(document.getElementById).toHaveBeenCalledWith("otp-1");
      expect(mockFocus).toHaveBeenCalled();
    });

    it("should not focus next input when at last index", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });

      handleOtpChange("5", 5, otpArray, mockSetOtpArray);
      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it("should handle missing element gracefully", () => {
      document.getElementById = vi.fn().mockReturnValue(null);

      handleOtpChange("5", 0, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).toHaveBeenCalledWith(["5", "", "", "", "", ""]);
    });

    it("should use custom idPrefix for focusing next input", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });

      handleOtpChange("5", 0, otpArray, mockSetOtpArray, "custom");
      expect(document.getElementById).toHaveBeenCalledWith("custom-1");
      expect(mockFocus).toHaveBeenCalled();
    });
  });

  describe("handleOtpKeyDown", () => {
    it("should focus previous input on backspace when current is empty", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });

      handleOtpKeyDown({ key: "Backspace" }, 1, otpArray);
      expect(document.getElementById).toHaveBeenCalledWith("otp-0");
      expect(mockFocus).toHaveBeenCalled();
    });

    it("should not focus previous input on backspace when current has value", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });
      otpArray[1] = "5";

      handleOtpKeyDown({ key: "Backspace" }, 1, otpArray);
      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it("should not focus previous input on other keys", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });

      handleOtpKeyDown({ key: "Delete" }, 1, otpArray);
      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it("should not focus previous input when at first index", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });

      handleOtpKeyDown({ key: "Backspace" }, 0, otpArray);
      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it("should handle missing element gracefully", () => {
      document.getElementById = vi.fn().mockReturnValue(null);

      handleOtpKeyDown({ key: "Backspace" }, 1, otpArray);
      // Should not throw error
    });

    it("should use custom idPrefix for focusing previous input", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });

      handleOtpKeyDown({ key: "Backspace" }, 1, otpArray, "custom");
      expect(document.getElementById).toHaveBeenCalledWith("custom-0");
      expect(mockFocus).toHaveBeenCalled();
    });
  });

  describe("handleOtpPaste", () => {
    it("should handle paste of 6 digits", () => {
      const mockEvent = {
        clipboardData: {
          getData: vi.fn().mockReturnValue("123456"),
        },
        preventDefault: vi.fn(),
      };

      handleOtpPaste(mockEvent, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).toHaveBeenCalledWith(["1", "2", "3", "4", "5", "6"]);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("should handle paste with non-digit characters", () => {
      const mockEvent = {
        clipboardData: {
          getData: vi.fn().mockReturnValue("12a34b56c"),
        },
        preventDefault: vi.fn(),
      };

      handleOtpPaste(mockEvent, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).toHaveBeenCalledWith(["1", "2", "3", "4", "5", "6"]);
    });

    it("should not set OTP if paste has less than 6 digits", () => {
      const mockEvent = {
        clipboardData: {
          getData: vi.fn().mockReturnValue("123"),
        },
        preventDefault: vi.fn(),
      };

      handleOtpPaste(mockEvent, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).not.toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("should slice to 6 digits if paste has more", () => {
      const mockEvent = {
        clipboardData: {
          getData: vi.fn().mockReturnValue("123456789"),
        },
        preventDefault: vi.fn(),
      };

      handleOtpPaste(mockEvent, otpArray, mockSetOtpArray);
      expect(mockSetOtpArray).toHaveBeenCalledWith(["1", "2", "3", "4", "5", "6"]);
    });

    it("should focus last input after successful paste", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });
      const mockEvent = {
        clipboardData: {
          getData: vi.fn().mockReturnValue("123456"),
        },
        preventDefault: vi.fn(),
      };

      handleOtpPaste(mockEvent, otpArray, mockSetOtpArray);
      expect(document.getElementById).toHaveBeenCalledWith("otp-5");
      expect(mockFocus).toHaveBeenCalled();
    });

    it("should use custom idPrefix for focusing last input after paste", () => {
      const mockFocus = vi.fn();
      document.getElementById = vi.fn().mockReturnValue({ focus: mockFocus });
      const mockEvent = {
        clipboardData: {
          getData: vi.fn().mockReturnValue("123456"),
        },
        preventDefault: vi.fn(),
      };

      handleOtpPaste(mockEvent, otpArray, mockSetOtpArray, "custom");
      expect(document.getElementById).toHaveBeenCalledWith("custom-5");
      expect(mockFocus).toHaveBeenCalled();
    });
  });

  describe("getOtpString", () => {
    it("should join OTP array into string", () => {
      const result = getOtpString(["1", "2", "3", "4", "5", "6"]);
      expect(result).toBe("123456");
    });

    it("should handle empty array", () => {
      const result = getOtpString([]);
      expect(result).toBe("");
    });

    it("should handle array with empty strings", () => {
      const result = getOtpString(["1", "", "3", "", "5", ""]);
      expect(result).toBe("135");
    });
  });

  describe("resetOtp", () => {
    it("should return empty OTP array", () => {
      const result = resetOtp();
      expect(result).toEqual(["", "", "", "", "", ""]);
    });
  });

  describe("getOtpInputClasses", () => {
    it("should return correct CSS classes", () => {
      const result = getOtpInputClasses();
      expect(result).toBe(
        "w-10 h-10 text-center text-lg font-semibold border-2 border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
      );
    });
  });
});
