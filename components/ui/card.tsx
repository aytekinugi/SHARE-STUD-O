import * as React from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("glass rounded-[1.75rem] p-5 shadow-2xl", className)} {...props} />; }
