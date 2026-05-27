export default function SuccessCard() {
  return (
    <div className="absolute bottom-6 right-4 bg-white rounded-2xl shadow-xl p-4 w-52 border border-gray-100">
      <div className="flex items-center gap-2 mb-1">

        {/* Green check icon */}
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
            Success Rate
          </p>
          <p className="text-2xl font-extrabold text-gray-900 leading-none">
            98%
          </p>
        </div>

      </div>
      <p className="text-xs text-gray-600 mt-1">
        Mentee satisfaction rise across all verified programs.
      </p>
    </div>
  );
}