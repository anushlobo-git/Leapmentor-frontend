/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/shared/ConnectsTab.jsx
import { useNavigate } from "react-router-dom";
import useOngoingConnects from "@features/connects/presenters/useOngoingConnects";
import type { MappedConnectRequest } from "@features/connects/models/connectsMapper";
import ConnectsLayout from "@features/connects/views/components/ConnectsLayout";
import ConnectCard from "@features/connects/views/components/ConnectCard";

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

interface ConnectCardPerson {
  currentRole?: string;
  company?: string;
  skills?: string[];
  profilePicture?: string;
}

const ConnectsTab = ({ role }: ConnectsTabProps) => {
  const { ongoing, completed, loading, error } = useOngoingConnects();
  const navigate = useNavigate();
  const cfg = ROLE_CONFIG[role];

  const renderCard = (c: MappedConnectRequest, isCompleted: boolean) => {
    const name = role === "mentee" ? c.mentor?.name : c.mentee?.name;
    const person =
      role === "mentee"
        ? (c.mentorProfile as ConnectCardPerson | null)
        : (c.menteeProfile as ConnectCardPerson | null);
    const session = {
      confirmedSlot: c.confirmedSlot ?? undefined,
      paidAt: c.paidAt ?? undefined,
      completedAt: c.completedAt ?? undefined,
      totalAmount: c.totalAmount ?? undefined,
    };
    const amount = c.totalAmount ?? 0;

    return (
      <ConnectCard
        key={c._id}
        name={name || cfg.counterpartLabel}
        person={person ?? undefined}
        session={session}
        tokenLabel={
          isCompleted
            ? cfg.completedTokenLabel(amount)
            : cfg.ongoingTokenLabel(amount)
        }
        isCompleted={isCompleted}
        onDashboardClick={() => navigate(`/shared-dashboard/${c._id}`)}
      />
    );
  };

  return (
    <ConnectsLayout
      title="Active Connects"
      subtitle={cfg.subtitle}
      count={ongoing.length}
      loading={loading}
      error={error ?? undefined}
      completedCount={completed.length}
      emptyState={cfg.emptyState}
      completedChildren={completed.map((c: MappedConnectRequest) => renderCard(c, true))}
    >
      {ongoing.map((c: MappedConnectRequest) => renderCard(c, false))}
    </ConnectsLayout>
  );
};


export default ConnectsTab;
