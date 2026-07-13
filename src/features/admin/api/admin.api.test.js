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

// Mock adminAxiosInstance
vi.mock("@lib/adminAxiosInstance", () => ({
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
      it("should call adminAxiosInstance.post with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await adminLogin("admin@example.com", "password123");

        expect(adminAxiosInstance.post).toHaveBeenCalledWith(
          "/admin/auth/login",
          { email: "admin@example.com", password: "password123" }
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe("adminLogout", () => {
      it("should call adminAxiosInstance.post with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await adminLogout();

        expect(adminAxiosInstance.post).toHaveBeenCalledWith("/admin/auth/logout");
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("layout / nav badges", () => {
    describe("getPendingLeapRequestsCount", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { count: 5 } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getPendingLeapRequestsCount();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/leap-requests/pending-count");
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("support messages", () => {
    describe("getSupportMessages", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getSupportMessages();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/support/messages");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("resolveSupportMessage", () => {
      it("should call adminAxiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await resolveSupportMessage("msg123");

        expect(adminAxiosInstance.patch).toHaveBeenCalledWith("/support/messages/msg123/resolve");
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("mentor verifications", () => {
    describe("getMentorVerifications", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getMentorVerifications();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/mentor-verifications");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("verifyMentorProfile", () => {
      it("should call adminAxiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await verifyMentorProfile("mentor123");

        expect(adminAxiosInstance.patch).toHaveBeenCalledWith("/admin/mentor-verifications/mentor123/verify");
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("reports", () => {
    describe("getReportStats", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { total: 10 } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getReportStats();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/reports/stats");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getReports", () => {
      it("should call adminAxiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const params = { page: 1, limit: 10 };
        const result = await getReports(params);

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/reports", { params });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("updateReport", () => {
      it("should call adminAxiosInstance.patch with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await updateReport("report123", { status: "resolved", adminNote: "Fixed" });

        expect(adminAxiosInstance.patch).toHaveBeenCalledWith("/admin/reports/report123", { status: "resolved", adminNote: "Fixed" });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("refundReport", () => {
      it("should call adminAxiosInstance.post with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await refundReport("report123", "Refunded");

        expect(adminAxiosInstance.post).toHaveBeenCalledWith("/admin/reports/report123/refund", { adminNote: "Refunded" });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("deleteReportSession", () => {
      it("should call adminAxiosInstance.delete with correct endpoint and data", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.delete.mockResolvedValue(mockResponse);

        const result = await deleteReportSession("report123", "Deleted");

        expect(adminAxiosInstance.delete).toHaveBeenCalledWith("/admin/reports/report123/session", { data: { adminNote: "Deleted" } });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("payments", () => {
    describe("getPaymentStats", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { total: 1000 } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getPaymentStats();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/payments/stats");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getPaymentChart", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getPaymentChart();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/payments/chart");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getPaymentTransactions", () => {
      it("should call adminAxiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const params = { page: 1 };
        const result = await getPaymentTransactions(params);

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/payments/transactions", { params });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("engagements", () => {
    describe("getEngagementStats", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { total: 50 } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getEngagementStats();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/engagements/stats");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getEngagements", () => {
      it("should call adminAxiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const params = { status: "active" };
        const result = await getEngagements(params);

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/engagements", { params });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("wallet / leap requests", () => {
    describe("getLeapRequests", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getLeapRequests();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/leap-requests");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("approveLeapRequest", () => {
      it("should call adminAxiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await approveLeapRequest("req123");

        expect(adminAxiosInstance.patch).toHaveBeenCalledWith("/leap-requests/req123/approve", {});
        expect(result).toEqual(mockResponse);
      });
    });

    describe("rejectLeapRequest", () => {
      it("should call adminAxiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await rejectLeapRequest("req123");

        expect(adminAxiosInstance.patch).toHaveBeenCalledWith("/leap-requests/req123/reject", {});
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("user management", () => {
    describe("getUserStats", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { total: 100 } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getUserStats();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/stats");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getUserGrowth", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getUserGrowth();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/user-growth");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getMentorIndustryStats", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getMentorIndustryStats();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/stats/mentor-industries");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("getUsers", () => {
      it("should call adminAxiosInstance.get with correct endpoint and params", async () => {
        const mockResponse = { data: [] };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const params = { role: "mentor" };
        const result = await getUsers(params);

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/users", { params });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("deleteUser", () => {
      it("should call adminAxiosInstance.delete with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.delete.mockResolvedValue(mockResponse);

        const result = await deleteUser("user123");

        expect(adminAxiosInstance.delete).toHaveBeenCalledWith("/admin/users/user123");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("blockUser", () => {
      it("should call adminAxiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await blockUser("user123");

        expect(adminAxiosInstance.patch).toHaveBeenCalledWith("/admin/users/user123/block", {});
        expect(result).toEqual(mockResponse);
      });
    });

    describe("unblockUser", () => {
      it("should call adminAxiosInstance.patch with correct endpoint", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.patch.mockResolvedValue(mockResponse);

        const result = await unblockUser("user123");

        expect(adminAxiosInstance.patch).toHaveBeenCalledWith("/admin/users/user123/unblock", {});
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe("settings", () => {
    describe("getCommissionSettings", () => {
      it("should call adminAxiosInstance.get with correct endpoint", async () => {
        const mockResponse = { data: { commissionRate: 0.1 } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.get.mockResolvedValue(mockResponse);

        const result = await getCommissionSettings();

        expect(adminAxiosInstance.get).toHaveBeenCalledWith("/admin/settings/commission");
        expect(result).toEqual(mockResponse);
      });
    });

    describe("updateCommissionSettings", () => {
      it("should call adminAxiosInstance.put with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.put.mockResolvedValue(mockResponse);

        const result = await updateCommissionSettings(0.15);

        expect(adminAxiosInstance.put).toHaveBeenCalledWith("/admin/settings/commission", { commissionRate: 0.15 });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("addAdmin", () => {
      it("should call adminAxiosInstance.post with correct endpoint and payload", async () => {
        const mockResponse = { data: { success: true } };
        const adminAxiosInstance = (await import("@lib/adminAxiosInstance")).default;
        adminAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await addAdmin({ name: "New Admin", email: "admin@example.com" });

        expect(adminAxiosInstance.post).toHaveBeenCalledWith("/admin/settings/add-admin", { name: "New Admin", email: "admin@example.com" });
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
