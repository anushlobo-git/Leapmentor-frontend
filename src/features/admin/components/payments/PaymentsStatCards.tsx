/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/admin/components/payments/PaymentsStatCards.jsx
import type { ReactNode } from "react";
import StatCard from "@features/admin/components/common/StatCard";
import { MONO } from "@features/admin/constants/payments.constants";

const LpIcon = () => (
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
);

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

interface PaymentStats {
  totalRevenue?: number;
  platformCommission?: number;
  commissionRate?: number;
  pendingPayouts?: number;
  refundedRequests?: number;
}

interface PaymentStatCard {
  label: string;
  value: number | undefined;
  sub: string | undefined;
  accent: string;
  icon: ReactNode;
  trend: undefined;
}

interface PaymentsStatCardsProps {
  stats?: PaymentStats | null;
}

const buildStatCards = (stats?: PaymentStats | null): PaymentStatCard[] => [
  {
    label: "Total Revenue",
    value: stats?.totalRevenue,
    sub: undefined,
    accent: "#2563eb",
    icon: <LpIcon />,
    trend: undefined,
  },
  {
    label: "Platform Commission",
    value: stats?.platformCommission,
    sub: stats?.commissionRate == null ? "—" : `${stats.commissionRate}% rate`,
    accent: "#059669",
    icon: <LpIcon />,
    trend: undefined,
  },
  {
    label: "Pending Payouts",
    value: stats?.pendingPayouts,
    sub: "Held in escrow",
    accent: "#d97706",
    icon: <ClockIcon />,
    trend: undefined,
  },
  {
    label: "Refunded Requests",
    value: stats?.refundedRequests,
    sub: "Requires Action",
    accent: "#dc2626",
    icon: <AlertIcon />,
    trend: undefined,
  },
];

const PaymentsStatCards = ({ stats }: PaymentsStatCardsProps) => {
  const cards = buildStatCards(stats);
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default PaymentsStatCards;
