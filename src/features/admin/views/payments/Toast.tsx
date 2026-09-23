/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/Toast.tsx
import { FONT } from "@features/admin/models/payments.constants";

export interface PaymentToastMessage {
  type?: string;
  msg: string;
}

export interface PaymentToastProps {
  toast: PaymentToastMessage | null;
}

const Toast = ({ toast }: PaymentToastProps) => {
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
      }}
    >
      {toast.msg}
    </div>
  );
};

export default Toast;
