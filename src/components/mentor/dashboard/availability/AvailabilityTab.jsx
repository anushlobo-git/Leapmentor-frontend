// components/mentor/dashboard/availability/AvailabilityTab.jsx
import useAvailability from "../../../../hooks/useAvailability";
import CalendarAvailabilitySection from "./CalendarAvailabilitySection";
import TimezoneDurationSection from "./TimezoneDurationSection";
import IntegrationsSection from "./IntegrationsSection";

const AvailabilityTab = () => {
  const {
    availability,
    loading,
    saving,
    msg,
    toggleDuration,
    updateTimezone,
    saveAvailability,
    cancelChanges,
    setSpecificDates,
  } = useAvailability();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header row — stacks on mobile, side-by-side on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Availability Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your calendar availability and integrations.
          </p>
        </div>
        {/* Buttons — full width on mobile, auto on sm+ */}
        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={cancelChanges}
            disabled={saving}
            className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveAvailability}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm shadow-blue-200"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* Status message */}
      {msg.text && (
        <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${
          msg.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <span>{msg.type === "success" ? "✓" : "⚠"}</span>
          {msg.text}
        </div>
      )}

      <CalendarAvailabilitySection
        specificDates={availability.specificDates || []}
        setSpecificDates={setSpecificDates}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TimezoneDurationSection
          timezone={availability.timezone}
          sessionDurations={availability.sessionDurations}
          updateTimezone={updateTimezone}
          toggleDuration={toggleDuration}
        />
        <IntegrationsSection
          googleCalendarConnected={availability.googleCalendarConnected}
        />
      </div>

      <div className="pt-1 pb-4">
        <p className="text-xs text-slate-400">
          Changes are saved to your profile and visible to mentees immediately.
        </p>
      </div>
    </div>
  );
};

export default AvailabilityTab;