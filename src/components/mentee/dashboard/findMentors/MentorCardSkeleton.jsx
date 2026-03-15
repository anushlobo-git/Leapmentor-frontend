// src/components/mentee/dashboard/findMentors/MentorCardSkeleton.jsx

const Shimmer = ({ className }) => (
  <div className={`bg-linear-to-r from-slate-100 via-slate-200 to-slate-100 rounded-xl animate-pulse ${className}`} />
);

const MentorCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Top row — avatar + name */}
      <div className="flex items-center gap-3">
        <Shimmer className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-3 w-24" />
        </div>
      </div>

      {/* Industry + role */}
      <div className="flex flex-col gap-2">
        <Shimmer className="h-3 w-40" />
        <Shimmer className="h-3 w-28" />
      </div>

      {/* Skills */}
      <div className="flex gap-2">
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-14 rounded-full" />
      </div>

      {/* Price + rating */}
      <div className="flex items-center justify-between mt-1">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-4 w-16" />
      </div>

      {/* Button */}
      <Shimmer className="h-9 w-full rounded-xl mt-1" />
    </div>
  );
};

export default MentorCardSkeleton;