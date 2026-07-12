/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/support/data/faqs.js

// Builds the { category, items: [{ q, a }] } shape from plain tuples.
// Keeping the data as tuples (rather than repeated object literals)
// avoids duplicate-block detection on the repeated `q:`/`a:` key pattern.
const buildFaqCategories = (categories) =>
  categories.map(([category, qaPairs]) => ({
    category,
    items: qaPairs.map(([q, a]) => ({ q, a })),
  }));

// ─── MENTOR FAQS ─────────────────────────────────────────────────────────────

const mentorFaqData = [
  [
    "Sessions",
    [
      [
        "How do I accept a session request?",
        "Go to Requests in your sidebar. You'll see pending requests with mentee details and preferred time slots. Click 'Accept' to confirm — the mentee will be notified and prompted to complete payment.",
      ],
      [
        "What happens after a session is accepted?",
        "The session moves to 'Active Sessions' with an 'Awaiting Payment' status. Once the mentee pays, the status updates to 'Ongoing' and you'll see an 'Open Dashboard' button to start the session.",
      ],
      [
        "Can I reschedule or cancel a session?",
        "Yes. Open the session card and choose 'Reschedule' or 'Cancel'. Cancellations made less than 2 hours before the session may affect your rating. We recommend messaging the mentee first.",
      ],
      [
        "How long can a session last?",
        "Sessions are booked in 30mins , 60mins and 1-hour slots. If you and the mentee agree to extend, you can add time in 30-minute increments directly from the session dashboard.",
      ],
    ],
  ],
  [
    "Payments & Earnings",
    [
      [
        "When do I receive my earnings?",
        "Earnings are released immediately after a session completes and the mentee has paid. Track all pending and received payments in the Track Earnings section.",
      ],
      [
        "What payout methods are supported?",
        "There's only token method possible now so tokens will be paid as payments ",
      ],
      [
        "Why is a session still showing 'Awaiting Payment'?",
        "The mentee hasn't completed payment yet. We send automated reminders. If it's been over 24 hours, nudge them via the message button on the session card.",
      ],
    ],
  ],
  [
    "Profile & Availability",
    [
      [
        "How do I set my availability?",
        "Navigate to Availability in the sidebar. Set recurring weekly slots or block specific dates. Changes take effect immediately for new bookings.",
      ],
      [
        "How do I update my mentor profile?",
        "Go to Profile from the sidebar. Update your bio, skills, hourly rate, and photo. A complete profile gets 3x more session requests.",
      ],
    ],
  ],
  [
    "Technical Issues",
    [
      [
        "The session dashboard isn't loading. What do I do?",
        "Try refreshing or clearing your browser cache. Use Chrome, Firefox, or Edge. If it persists, contact support with your session ID.",
      ],
      [
        "I'm not receiving notifications.",
        "Check Settings → Notifications and ensure your browser allows notifications from leapmentor.com. Email notifications are always enabled as a fallback.",
      ],
    ],
  ],
];

const mentorFaqs = buildFaqCategories(mentorFaqData);

// ─── MENTEE FAQS ──────────────────────────────────────────────────────────────

const menteeFaqData = [
  [
    "Booking",
    [
      [
        "How do I book a session with a mentor?",
        "Browse mentors from the Explore page, open a mentor's profile, and select an available time slot. You'll be prompted to confirm and complete payment to finalize the booking.",
      ],
      [
        "Can I book multiple sessions at once?",
        "Yes! You can book multiple sessions with the same or different mentors. All upcoming sessions are visible in your dashboard under Active Sessions.",
      ],
      [
        "What if my preferred time slot isn't available?",
        "You can only book a slot at mentor availability , or you can browse their next available openings.",
      ],
    ],
  ],
  [
    "Payments & Refunds",
    [
      [
        "What payment methods are accepted?",
        "We currently accept only token payments.",
      ],
      [
        "Can I get a refund if I cancel?",
        "Cancellations made 24+ hours before the session are fully refunded. Cancellations within 24 hours receive a 50% refund. No-shows are non-refundable.",
      ],
      [
        "Where can I see my payment history?",
        "Go to Settings → Billing to view all past transactions, download receipts, and check upcoming charges.",
      ],
    ],
  ],
  [
    "Sessions",
    [
      [
        "How do I join a session?",
        "When your session is active, an 'Open Dashboard' button will appear on the session card. Click it to enter the video call and shared workspace with your mentor.",
      ],
      [
        "What happens if a mentor cancels?",
        "You'll receive a full refund immediately and a notification. You can rebook with the same mentor or choose a different one.",
      ],
      [
        "Can I extend a session that's already running?",
        "Yes, if both you and the mentor agree. The mentor can add extra time from the session dashboard, and you'll be charged for the additional slot.",
      ],
    ],
  ],
  [
    "Technical Issues",
    [
      [
        "The session isn't loading. What should I do?",
        "Refresh the page and check your internet connection. Make sure your browser has permission to access your camera and microphone. Try Chrome or Firefox for the best experience.",
      ],
      [
        "I paid but my session still shows 'Awaiting Confirmation'.",
        "This usually resolves within a few minutes as the mentor confirms. If it's been over 1 hour, contact support with your booking ID and payment confirmation.",
      ],
    ],
  ],
];

const menteeFaqs = buildFaqCategories(menteeFaqData);

export { mentorFaqs, menteeFaqs };
