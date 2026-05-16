import * as React from "react";
import { cn } from "@/lib/utils";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("h-12 w-full rounded-2xl border border-gold/15 bg-black/50 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 focus:ring-2 focus:ring-gold/10", className)} {...props} />
));
Input.displayName = "Input";
