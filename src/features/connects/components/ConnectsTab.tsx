/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/shared/ConnectsTab.jsx
import { useNavigate } from "react-router-dom";
import useOngoingConnects from "@features/connects/hooks/useOngoingConnects";
import ConnectsLayout from "@features/connects/components/ConnectsLayout";
import ConnectCard from "@features/connects/components/ConnectCard";

interface RoleConfig {
  subtitle: string;
  counterpartKey: string;
  counterpartProfileKey: string;
  counterpartLabel: string;
  ongoingTokenLabel: (amt: number) => string;
  completedTokenLabel: (amt: number) => string;
  emptyState: {
    message: string;
    subMessage?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
}

const ROLE_CONFIG: Record<string, RoleConfig> = {
  mentee: {
    subtitle: "Manage your ongoing mentorship sessions and review progress.",
    counterpartKey: "mentor",
    counterpartProfileKey: "mentorProfile",
    counterpartLabel: "Mentor",
    ongoingTokenLabel: (amt: number) => `${amt} tokens in escrow`,
    completedTokenLabel: (amt: number) => `${amt} tokens released`,
    emptyState: {
      message: "No active connections yet",
      subMessage:
        "Once a mentor accepts your request and you complete escrow payment, your active sessions will appear here.",
      actionLabel: "Find Mentors",
      onAction: () =>
        globalThis.dispatchEvent(new CustomEvent("setDashboardTab", { detail: "findMentors" })),
    },
  },
  mentor: {
    subtitle: "Manage your ongoing mentee sessions and track their progress.",
    counterpartKey: "mentee",
    counterpartProfileKey: "menteeProfile",
    counterpartLabel: "Mentee",
    ongoingTokenLabel: (amt: number) => `${amt} tokens pending release`,
    completedTokenLabel: (amt: number) => `${amt} tokens received`,
    emptyState: {
      message: "No active mentees yet",
      subMessage:
        "Sessions appear here once a mentee completes escrow payment for an accepted request.",
    },
  },
};

interface ConnectsTabProps {
  role: "mentee" | "mentor";
}

const ConnectsTab = ({ role }: ConnectsTabProps) => {
  const { ongoing, completed, loading, error } = useOngoingConnects();
  const navigate = useNavigate();
  const cfg = ROLE_CONFIG[role];

  const renderCard = (c: any, isCompleted: boolean) => (
    <ConnectCard
      key={c._id}
      name={c[cfg.counterpartKey]?.name || cfg.counterpartLabel}
      person={c[cfg.counterpartProfileKey]}
      session={c}
      tokenLabel={
        isCompleted ? cfg.completedTokenLabel(c.totalAmount) : cfg.ongoingTokenLabel(c.totalAmount)
      }
      isCompleted={isCompleted}
      onDashboardClick={() => navigate(`/shared-dashboard/${c._id}`)}
    />
  );

  return (
    <ConnectsLayout
      title="Active Connects"
      subtitle={cfg.subtitle}
      count={ongoing.length}
      loading={loading}
      error={error}
      completedCount={completed.length}
      emptyState={cfg.emptyState}
      completedChildren={completed.map((c: any) => renderCard(c, true))}
    >
      {ongoing.map((c: any) => renderCard(c, false))}
    </ConnectsLayout>
  );
};


export default ConnectsTab;
