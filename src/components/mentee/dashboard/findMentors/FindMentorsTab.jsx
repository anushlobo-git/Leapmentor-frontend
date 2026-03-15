// src/components/mentee/dashboard/findMentors/FindMentorsTab.jsx
import { useState } from "react";
import useMentorSearch from "../../../../hooks/useMentorSearch";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import MentorGrid from "./MentorGrid";
import MentorProfileModal from "./MentorProfileModal";

const FindMentorsTab = () => {
  const {
    skill,
    filters,
    mentors,
    loading,
    loadingMore,
    error,
    hasSearched,
    hasMore,
    totalCount,
    setSkill,
    setName, 
    updateFilter,
    resetFilters,
    loadMore,
  } = useMentorSearch();

  // ✅ Modal state — which mentor is selected
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleViewProfile = (mentor) => setSelectedMentor(mentor);
  const handleCloseModal  = () => setSelectedMentor(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Find Mentors</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Search by skill to find the right mentor for your goals.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3">
        <SearchBar
          skill={skill}
          setSkill={setSkill}
          setName={setName} 
          totalCount={totalCount}
          hasSearched={hasSearched}
        />
        <FilterPanel
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Results grid */}
      <MentorGrid
        mentors={mentors}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        hasSearched={hasSearched}
        totalCount={totalCount}
        onLoadMore={loadMore}
        onViewProfile={handleViewProfile} // ✅ passed down
      />

      {/* ✅ Mentor profile modal — renders only when a mentor is selected */}
      {selectedMentor && (
        <MentorProfileModal
          mentor={selectedMentor}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default FindMentorsTab;