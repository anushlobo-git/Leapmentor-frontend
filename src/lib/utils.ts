//Brings in the clsx tool, plus a TypeScript type called ClassValue that describes
// "the kinds of things you can pass in" (strings, false, undefined and so on).
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
//Your utils.ts builds cn yourself from two packages:
// clsx joins the classes, and tailwind-merge resolves conflicts.

//The ...inputs means "accept any number of arguments",
// so cn("a"), cn("a", "b") and cn("a", cond && "b", "c") all work.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// So this works safely:
//there is code written for the components and then the code
//like lets say px-4 inside the shadcn components and then from
//outside u have the px-10 so there is a tailwind clash between them so to
//resolve them
// tsx
// <Button className="px-10">Save</Button>

// The button's default px-4 and your px-10 conflict,
//  and tailwind-merge makes sure yours wins. Without cn,
//  you couldn't reliably customize shadcn components from the outside.
