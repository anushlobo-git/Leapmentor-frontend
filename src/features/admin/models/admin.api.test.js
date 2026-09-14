/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  adminLogin,
  adminLogout,
  getPendingLeapRequestsCount,
  getSupportMessages,
  resolveSupportMessage,
  getMentorVerifications,
  verifyMentorProfile,
  getReportStats,
  getReports,
  updateReport,
  refundReport,
  deleteReportSession,
  getPaymentStats,
  getPaymentChart,
  getPaymentTransactions,
  getEngagementStats,
  getEngagements,
  getLeapRequests,
  approveLeapRequest,
  rejectLeapRequest,
  getUserStats,
  getUserGrowth,
  getMentorIndustryStats,
  getUsers,
  deleteUser,
  blockUser,
  unblockUser,
  getCommissionSettings,
  updateCommissionSettings,
  addAdmin,
} from "./admin.api";

// Mock axiosInstance
vi.mock("@lib/http/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("admin.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("auth", () => {
    describe("adminLogin", () => {
      it("should call axiosInstance.post with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await adminLogin("admin@example.com", "password123");

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/admin/auth/login",
          { email: "admin@example.com", password: "password123" },
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("adminLogout", () => {
      it("should call axiosInstance.post with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await adminLogout();

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/admin/auth/logout",
          null,
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("layout / nav badges", () => {
    describe("getPendingLeapRequestsCount", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { count: 5 } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getPendingLeapRequestsCount();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/leap-requests/pending-count",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("support messages", () => {
    describe("getSupportMessages", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getSupportMessages();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/support/messages",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("resolveSupportMessage", () => {
      it("should call axiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await resolveSupportMessage("msg123");

        expect(axiosInstance.patch).toHaveBeenCalledWith(
          "/support/messages/msg123/resolve",
          null,
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("mentor verifications", () => {
    describe("getMentorVerifications", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getMentorVerifications();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/mentor-verifications",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("verifyMentorProfile", () => {
      it("should call axiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await verifyMentorProfile("mentor123");

        expect(axiosInstance.patch).toHaveBeenCalledWith(
          "/admin/mentor-verifications/mentor123/verify",
          null,
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("reports", () => {
    describe("getReportStats", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { total: 10 } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getReportStats();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/reports/stats",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getReports", () => {
      it("should call axiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const params = { page: 1, limit: 10 };
        const result = await getReports(params);

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/reports",
          expect.objectContaining({ params, authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("updateReport", () => {
      it("should call axiosInstance.patch with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await updateReport("report123", {
          status: "resolved",
          adminNote: "Fixed",
        });

        expect(axiosInstance.patch).toHaveBeenCalledWith(
          "/admin/reports/report123",
          { status: "resolved", adminNote: "Fixed" },
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("refundReport", () => {
      it("should call axiosInstance.post with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await refundReport("report123", "Refunded");

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/admin/reports/report123/refund",
          { adminNote: "Refunded" },
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("deleteReportSession", () => {
      it("should call axiosInstance.delete with correct endpoint and data", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.delete.mockResolvedValue(mockResponse);

        const result = await deleteReportSession("report123", "Deleted");

        expect(axiosInstance.delete).toHaveBeenCalledWith(
          "/admin/reports/report123/session",
          expect.objectContaining({
            data: { adminNote: "Deleted" },
            authDomain: "admin",
          }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("payments", () => {
    describe("getPaymentStats", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { total: 1000 } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getPaymentStats();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/payments/stats",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getPaymentChart", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getPaymentChart();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/payments/chart",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getPaymentTransactions", () => {
      it("should call axiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const params = { page: 1 };
        const result = await getPaymentTransactions(params);

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/payments/transactions",
          expect.objectContaining({ params, authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("engagements", () => {
    describe("getEngagementStats", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { total: 50 } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getEngagementStats();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/engagements/stats",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getEngagements", () => {
      it("should call axiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const params = { status: "active" };
        const result = await getEngagements(params);

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/engagements",
          expect.objectContaining({ params, authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("wallet / leap requests", () => {
    describe("getLeapRequests", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getLeapRequests();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/leap-requests",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("approveLeapRequest", () => {
      it("should call axiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await approveLeapRequest("req123");

        expect(axiosInstance.patch).toHaveBeenCalledWith(
          "/leap-requests/req123/approve",
          {},
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("rejectLeapRequest", () => {
      it("should call axiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await rejectLeapRequest("req123");

        expect(axiosInstance.patch).toHaveBeenCalledWith(
          "/leap-requests/req123/reject",
          {},
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("user management", () => {
    describe("getUserStats", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { total: 100 } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getUserStats();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/stats",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getUserGrowth", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getUserGrowth();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/user-growth",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getMentorIndustryStats", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getMentorIndustryStats();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/stats/mentor-industries",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getUsers", () => {
      it("should call axiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const params = { role: "mentor" };
        const result = await getUsers(params);

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/users",
          expect.objectContaining({ params, authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("deleteUser", () => {
      it("should call axiosInstance.delete with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.delete.mockResolvedValue(mockResponse);

        const result = await deleteUser("user123");

        expect(axiosInstance.delete).toHaveBeenCalledWith(
          "/admin/users/user123",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("blockUser", () => {
      it("should call axiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await blockUser("user123");

        expect(axiosInstance.patch).toHaveBeenCalledWith(
          "/admin/users/user123/block",
          {},
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("unblockUser", () => {
      it("should call axiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await unblockUser("user123");

        expect(axiosInstance.patch).toHaveBeenCalledWith(
          "/admin/users/user123/unblock",
          {},
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("settings", () => {
    describe("getCommissionSettings", () => {
      it("should call axiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { commissionRate: 0.1 } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getCommissionSettings();

        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/admin/settings/commission",
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("updateCommissionSettings", () => {
      it("should call axiosInstance.put with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.put.mockResolvedValue(mockResponse);

        const result = await updateCommissionSettings(0.15);

        expect(axiosInstance.put).toHaveBeenCalledWith(
          "/admin/settings/commission",
          { commissionRate: 0.15 },
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("addAdmin", () => {
      it("should call axiosInstance.post with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const axiosInstance = (await import("@lib/http/axiosInstance")).default;
        axiosInstance.post.mockResolvedValue(mockResponse);

        const result = await addAdmin({
          name: "New Admin",
          email: "admin@example.com",
        });

        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/admin/settings/add-admin",
          { name: "New Admin", email: "admin@example.com" },
          expect.objectContaining({ authDomain: "admin" }),
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
