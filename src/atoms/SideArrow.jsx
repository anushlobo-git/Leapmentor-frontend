export default function SideArrow({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="hidden md:flex w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm items-center justify-center hover:bg-violet-50 hover:border-violet-200 transition-all shrink-0 z-10"
          >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="9 18 15 12 9 6" />
        </svg>
    </button>
    );
    }