/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/pages/AdminSettings.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCommissionSettings,
  updateCommissionSettings,
  addAdmin,
} from "@features/admin/api/admin.api";
import AdminLayout from "@features/admin/components/AdminLayout";
import PropTypes from "prop-types";
import { commissionSchema, addAdminSchema } from "@lib/validation/schemas";

const FONT = "'DM Sans', sans-serif";
const MONO = "'DM Mono', monospace";

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div
      className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm"
      style={{
        fontWeight: 600,
        fontFamily: FONT,
        background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
        color: toast.type === "success" ? "#15803d" : "#dc2626",
        animation: "slideIn 0.2s ease",
      }}
    >
      {toast.type === "success" ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {toast.msg}
    </div>
  );
};

const SectionCard = ({
  title,
  subtitle,
  icon,
  children,
  accent = "#2563eb",
}) => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{ background: "#ffffff", border: "1px solid #e8eaf0" }}
  >
    <div
      className="px-6 py-5 border-b flex items-center gap-3"
      style={{ borderColor: "#e8eaf0", background: "#fafbfc" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}14` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p
          className="text-sm font-700 text-slate-800"
          style={{ fontWeight: 700, fontFamily: FONT }}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const SubmitBtn = ({ loading, label, accent = "#2563eb", type = "button" }) => (
  <button
    type={type}
    disabled={loading}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-600 text-white transition-all disabled:opacity-50 whitespace-nowrap"
    style={{
      background: accent,
      fontWeight: 600,
      fontFamily: FONT,
      boxShadow: `0 4px 14px ${accent}30`,
    }}
  >
    {loading && (
      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
    )}
    {loading ? "Saving..." : label}
  </button>
);

const OverviewCard = ({ label, value, icon, accent, sub }) => (
  <div
    className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden"
    style={{ background: "#ffffff", border: "1px solid #e8eaf0" }}
  >
    <div
      className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
      style={{
        background: `radial-gradient(circle at top right, ${accent}15, transparent 70%)`,
      }}
    />
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: `${accent}14` }}
    >
      <span style={{ color: accent }}>{icon}</span>
    </div>
    <div>
      <p
        className="text-2xl font-700 text-slate-900"
        style={{ fontWeight: 700, fontFamily: FONT }}
      >
        {value?.toLocaleString() ?? "—"}
      </p>
      <p className="text-xs text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminSettings = () => {
  const [toast, setToast] = useState(null);
  const [tempPw, setTempPw] = useState("");
  const [savingCommission, setSavingCommission] = useState(false);

  const {
    register: registerCommission,
    handleSubmit: handleCommissionSubmit,
    formState: {
      errors: commissionErrors,
      isSubmitting: isCommissionSubmitting,
    },
    setValue: setCommissionValue,
  } = useForm({
    resolver: zodResolver(commissionSchema),
    mode: "onTouched",
    defaultValues: {
      commission: "",
    },
  });

  const {
    register: registerAdmin,
    handleSubmit: handleAdminSubmit,
    formState: { errors: adminErrors, isSubmitting: isAdminSubmitting },
    reset: resetAdminForm,
  } = useForm({
    resolver: zodResolver(addAdminSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cmRes = await getCommissionSettings();

        setCommissionValue("commission", Number(cmRes.data.commissionRate));
      } catch {
        showToast("Failed to load settings.", "error");
      }
    };
    fetchData();
  }, [setCommissionValue]);

  const onCommissionSubmit = async (data) => {
    try {
      setSavingCommission(true);
      await updateCommissionSettings(Number.parseFloat(data.commission));
      showToast(`Commission rate set to ${data.commission}%`);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to update commission.",
        "error",
      );
    } finally {
      setSavingCommission(false);
    }
  };

  const onAdminSubmit = async (data) => {
    try {
      setTempPw("");
      const res = await addAdmin({
        name: data.name.trim(),
        email: data.email.trim(),
      });
      setTempPw(res.data.tempPassword);
      showToast(`Admin account created for ${data.email}`);
      resetAdminForm();
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to create admin.",
        "error",
      );
    }
  };

  return (
    <AdminLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Toast toast={toast} />

      <div className="space-y-6">
        <div>
          <h1
            className="text-2xl font-700 text-slate-900"
            style={{ fontWeight: 700, fontFamily: FONT }}
          >
            Admin Settings
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage platform configurations and preferences.
          </p>
        </div>

        {/* ── Commission Rate ── */}
        <SectionCard
          title="Platform Commission Rate"
          subtitle="Set the % deducted from each mentor payout"
          accent="#d97706"
          icon={
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                fontFamily: MONO,
                color: "currentColor",
                letterSpacing: "-0.02em",
              }}
            >
              LP
            </span>
          }
        >
          {/* Fixed layout — input + button side by side, button aligned to input height */}
          <form
            onSubmit={handleCommissionSubmit(onCommissionSubmit)}
            className="flex gap-3"
            style={{ alignItems: "flex-start" }}
          >
            <div style={{ width: 240 }}>
              <label
                htmlFor="commission-rate"
                className="text-xs font-600 text-slate-900 block mb-1.5"
                style={{ fontWeight: 600, fontFamily: FONT }}
              >
                Commission Rate (%)
              </label>
              <input
                id="commission-rate"
                {...registerCommission("commission", { valueAsNumber: true })}
                type="number"
                step="0.01"
                aria-invalid={!!commissionErrors.commission}
                aria-describedby={
                  commissionErrors.commission ? "commission-error" : undefined
                }
                placeholder="e.g. 10"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  fontFamily: FONT,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#fed7aa")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
              {commissionErrors.commission && (
                <span
                  id="commission-error"
                  role="alert"
                  className="text-red-600 text-xs mt-1"
                >
                  {commissionErrors.commission.message}
                </span>
              )}
              <p className="text-[10px] text-slate-600 mt-1">
                Applied to every mentor payout. Must be between 0–100.
              </p>
            </div>

            {/*  mt-6 pushes button down to align with input (label height = ~1.5rem) */}
            <div style={{ marginTop: "1.6rem" }}>
              <SubmitBtn
                loading={savingCommission || isCommissionSubmitting}
                label="Save Rate"
                accent="#d97706"
                type="submit"
              />
            </div>
          </form>
        </SectionCard>

        {/* ── Add Other Admin ── */}
        <SectionCard
          title="Add Other Admin"
          subtitle="Invite a new admin to manage the platform"
          accent="#059669"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          }
        >
          <form onSubmit={handleAdminSubmit(onAdminSubmit)}>
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div>
                <label
                  htmlFor="admin-name"
                  className="text-xs font-600 text-slate-900 block mb-1.5"
                  style={{ fontWeight: 600, fontFamily: FONT }}
                >
                  Full Name
                </label>
                <input
                  id="admin-name"
                  {...registerAdmin("name")}
                  type="text"
                  aria-invalid={!!adminErrors.name}
                  aria-describedby={
                    adminErrors.name ? "admin-name-error" : undefined
                  }
                  placeholder="e.g. Sarah Admin"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                    fontFamily: FONT,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
                {adminErrors.name && (
                  <span
                    id="admin-name-error"
                    role="alert"
                    className="text-red-600 text-xs mt-1"
                  >
                    {adminErrors.name.message}
                  </span>
                )}
              </div>
              <div>
                <label
                  htmlFor="admin-email"
                  className="text-xs font-600 text-slate-900 block mb-1.5"
                  style={{ fontWeight: 600, fontFamily: FONT }}
                >
                  Email Address
                </label>
                <input
                  id="admin-email"
                  {...registerAdmin("email")}
                  type="email"
                  aria-invalid={!!adminErrors.email}
                  aria-describedby={
                    adminErrors.email ? "admin-email-error" : undefined
                  }
                  placeholder="admin@leapmentor.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                    fontFamily: FONT,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
                {adminErrors.email && (
                  <span
                    id="admin-email-error"
                    role="alert"
                    className="text-red-600 text-xs mt-1"
                  >
                    {adminErrors.email.message}
                  </span>
                )}
                <p className="text-[10px] text-slate-600 mt-1">
                  {" "}
                  Password will be generated.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <SubmitBtn
                loading={isAdminSubmitting}
                label="Create Admin Account"
                accent="#059669"
                type="submit"
              />
            </div>
          </form>

          {tempPw && (
            <div
              className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <p
                  className="text-xs font-600 text-emerald-700"
                  style={{ fontWeight: 600 }}
                >
                  Password — share securely with the new admin:
                </p>
                <p
                  className="text-sm font-700 text-emerald-800 mt-0.5"
                  style={{ fontFamily: MONO, fontWeight: 700 }}
                >
                  {tempPw}
                </p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </AdminLayout>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    msg: PropTypes.string,
    type: PropTypes.oneOf(["success", "error"]),
  }),
};

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  accent: PropTypes.string,
};

SubmitBtn.propTypes = {
  loading: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  accent: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit"]),
};

OverviewCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  icon: PropTypes.node.isRequired,
  accent: PropTypes.string.isRequired,
  sub: PropTypes.string,
};

export default AdminSettings;
