import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "bg-gradient-primary text-primary-foreground shadow-card hover:shadow-glow hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] active:translate-y-0",
        destructive: 
          "bg-destructive text-destructive-foreground shadow-card hover:bg-destructive/90 hover:-translate-y-1 hover:shadow-hover active:scale-[0.98]",
        outline: 
          "border-2 border-primary/30 bg-background/50 backdrop-blur-sm shadow-sm hover:bg-primary/5 hover:border-primary/50 hover:-translate-y-1 hover:shadow-card active:scale-[0.98]",
        secondary: 
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:-translate-y-1 hover:shadow-card active:scale-[0.98]",
        ghost: 
          "hover:bg-muted/60 hover:text-foreground backdrop-blur-sm active:scale-[0.98]",
        link: 
          "text-primary underline-offset-4 hover:underline",
        glass:
          "glass-subtle text-foreground shadow-glass hover:bg-background/70 hover:-translate-y-1 hover:shadow-hover active:scale-[0.98]",
        glow:
          "bg-gradient-primary text-primary-foreground shadow-glow animate-glow-pulse hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
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
