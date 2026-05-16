import * as React from "react";
import { cn } from "@/lib/utils";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("min-h-28 w-full rounded-2xl border border-gold/15 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 focus:ring-2 focus:ring-gold/10", className)} {...props} />
));
Textarea.displayName = "Textarea";
