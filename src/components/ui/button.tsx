import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 active:translate-y-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-card hover:bg-primary-light hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.3)]",
        destructive: "bg-destructive text-destructive-foreground shadow-card hover:bg-destructive/90 hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_hsl(var(--destructive)/0.3)]",
        outline: "border-2 border-input bg-background shadow-sm hover:bg-muted hover:text-foreground hover:border-primary/50 hover:-translate-y-1 hover:shadow-[0_8px_20px_-4px_hsl(var(--primary)/0.15)]",
        secondary: "bg-secondary text-secondary-foreground shadow-card hover:bg-secondary/80 hover:-translate-y-1 hover:shadow-[0_8px_20px_-4px_hsl(0_0%_0%/0.2)]",
        ghost: "hover:bg-muted hover:text-foreground hover:-translate-y-0.5 hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
