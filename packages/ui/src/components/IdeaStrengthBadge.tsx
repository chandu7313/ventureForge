import * as React from "react";
import { cn } from "../lib/utils";

export type IdeaStrength = "Weak" | "Viable" | "Strong" | "Exceptional";

export interface IdeaStrengthBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  strength: IdeaStrength;
}

export const IdeaStrengthBadge = React.forwardRef<HTMLSpanElement, IdeaStrengthBadgeProps>(
  ({ strength, className, ...props }, ref) => {
    const styles: Record<IdeaStrength, string> = {
      Weak: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Viable: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Strong: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Exceptional: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
          styles[strength],
          className
        )}
        {...props}
      >
        {strength}
      </span>
    );
  }
);
IdeaStrengthBadge.displayName = "IdeaStrengthBadge";
