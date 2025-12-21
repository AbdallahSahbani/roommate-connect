import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-wide uppercase ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground shadow-card hover:bg-primary-light hover:shadow-hover hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
        destructive: 
          "bg-destructive text-destructive-foreground shadow-card hover:bg-destructive/90 hover:shadow-hover hover:scale-[1.02] active:scale-[0.97]",
        outline: 
          "border border-border bg-transparent shadow-sm hover:bg-muted hover:border-primary/40 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.97]",
        secondary: 
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:scale-[1.02] active:scale-[0.97]",
        ghost: 
          "hover:bg-muted/60 hover:text-foreground hover:scale-[1.02] active:scale-[0.97]",
        link: 
          "text-accent underline-offset-4 hover:underline uppercase tracking-wide relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full",
        glass:
          "glass-subtle text-foreground shadow-glass hover:bg-background/80 hover:shadow-hover hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.97]",
        accent:
          "bg-accent text-accent-foreground shadow-card hover:bg-accent/90 hover:shadow-glow hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.97]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8 text-sm",
        xl: "h-12 px-10 text-base",
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
