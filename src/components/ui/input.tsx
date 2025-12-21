import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-border bg-background/70 backdrop-blur-sm px-4 py-2 text-base ring-offset-background",
          "transition-all duration-300 ease-out",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground placeholder:transition-opacity placeholder:duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary/50 focus-visible:bg-background focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
          "focus-visible:placeholder:opacity-50",
          "hover:border-primary/30 hover:bg-background/80 hover:shadow-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
