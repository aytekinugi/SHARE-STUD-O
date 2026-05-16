import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gold text-black shadow-gold hover:bg-[#f1ce59]",
        secondary: "border border-gold/25 bg-gold/10 text-gold hover:bg-gold/15",
        ghost: "text-zinc-200 hover:bg-white/10 hover:text-white",
        destructive: "bg-red-500 text-white hover:bg-red-400"
      },
      size: { default: "h-11 px-5", sm: "h-9 px-3", lg: "h-14 px-7 text-base", icon: "h-11 w-11" }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
));
Button.displayName = "Button";
