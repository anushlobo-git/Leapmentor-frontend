/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useRef } from "react";
import { Button } from "@components/shadcn/button";
/*
- Dialog manages whether the popup is open or closed.
- DialogContent is the visible popup box.
- DialogTitle is its heading: “Contact Us”.
- DialogDescription is its explanation: “Have questions? We’d love to hear from you.”

Dialog — controls the popup
  └── DialogContent — the box
        ├── DialogTitle — heading
        └── DialogDescription — explanation
*/
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@components/shadcn/dialog";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}


// Replaced the custom popup box
// The old native <dialog> and its surrounding code became:

// <DialogContent>
//   {/* Contact information */}
// </DialogContent>

// This component now handles:
// Clicking outside to close
// Pressing Escape to close
// Moving keyboard focus into the popup
// Keeping Tab navigation inside it
// Preventing background scrolling
// That let me remove our manually written Escape listener, backdrop button, and animation code.
export default function ContactModal({ isOpen, onClose }: Readonly<ContactModalProps>) {
  const openerRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        //this hides or removes the default close button x in the top-right corner of the popup box
        showCloseButton={false}
        className="block max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white p-8 text-center shadow-2xl sm:max-w-[420px]"
        //Remembers the previously focused element
        onOpenAutoFocus={() => {
          // The Footer opens this modal from a button outside the Dialog.
          openerRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        }}
        //Returns keyboard focus to that element
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          openerRef.current?.focus();
        }}
      >
        {/* Icon */}
        <div className="mx-auto mb-[18px] flex size-[52px] items-center justify-center rounded-[14px] bg-gradient-to-br from-[#6366f1] to-[#4f46e5]">
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <DialogTitle className="mb-1.5 text-lg font-bold leading-normal text-slate-900">
          Contact Us
        </DialogTitle>
        <DialogDescription className="mb-5 text-[13px] text-slate-400">
          Have questions? We&apos;d love to hear from you.
        </DialogDescription>

        <a
          href="https://mail.google.com/mail/?view=cm&to=leapmentor2026@gmail.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-indigo-600 no-underline transition-all duration-200 hover:border-indigo-300 hover:bg-violet-100"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          leapmentor2026@gmail.com
        </a>

        <div className="mt-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-auto rounded-lg border-slate-200 bg-transparent px-6 py-2 text-[13px] font-normal text-slate-500 hover:bg-slate-50 hover:text-slate-500"
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

//<DialogClose asChild>
//   <Button type="button" variant="outline">
//     Close
//   </Button>
// </DialogClose>
// asChild means: “Give this existing Button the closing behavior.”
// Without it, DialogClose would create its own button around our Button. We want one button, with both the styling and closing behavior.
// I also used showCloseButton={false} on DialogContent because we already have our own Close button.
