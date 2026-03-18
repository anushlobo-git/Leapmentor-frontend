// src/components/admin/common/StatusBadge.jsx

const STATUS_CONFIG = {
  pending:   { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Pending"   },
  accepted:  { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", label: "Accepted"  },
  ongoing:   { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe", label: "Ongoing"   },
  completed: { bg: "#f0fdf4", color: "#059669", border: "#bbf7d0", label: "Completed" },
  rejected:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Rejected"  },
  referred:  { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa", label: "Referred"  },
  paid:      { bg: "#f0fdf4", color: "#059669", border: "#bbf7d0", label: "Paid"      },
  unpaid:    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Unpaid"    },
  refunded:  { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", label: "Refunded"  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {
    bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", label: status,
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-700 uppercase tracking-wide"
      style={{
        background:    cfg.bg,
        color:         cfg.color,
        border:        `1px solid ${cfg.border}`,
        fontWeight:    700,
        letterSpacing: "0.06em",
        fontFamily:    "'DM Sans', sans-serif",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
};


export default StatusBadge;