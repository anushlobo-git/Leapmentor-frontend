const footerLinks = {
  "For Mentees": ["Find a Mentor", "How It Works", "Mentorship Costs", "Career Resources"],
  "For Mentors": ["Become a Mentor", "Mentor Guidelines", "Benefits", "Success Stories"],
  Company: ["About Us", "Careers", "Contact", "Privacy Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src="/images/logo.webp"
                  alt="LeapMentor logo"
                  className="h-8 w-8"
                  width={32}
                  height={32}
                />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">LeapMentor</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              The world's leading mentorship platform for professional career growth and leadership development.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Follow us on X (Twitter)" className="text-gray-300 hover:text-white transition-colors duration-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="Follow us on Instagram" className="text-gray-300 hover:text-white transition-colors duration-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="Follow us on LinkedIn" className="text-gray-300 hover:text-white transition-colors duration-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#"
                      className="text-gray-300 text-sm hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">© 2026 LeapMentor Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 text-xs hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 text-xs hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer >
  );
}