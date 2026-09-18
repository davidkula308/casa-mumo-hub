import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-terra text-cream shadow-terra ring-1 ring-terra/40 hover:-translate-y-0.5 hover:bg-terra-deep",
        hero: "bg-terra text-cream shadow-terra-lg ring-1 ring-terra/40 hover:-translate-y-0.5 rounded-2xl",
        glass: "bg-glass text-ink ring-1 ring-border backdrop-blur-md hover:bg-glass-strong",
        olive: "bg-olive/15 text-olive ring-1 ring-olive/20 hover:bg-olive/25",
        "olive-solid": "bg-olive text-cream shadow-olive ring-1 ring-olive/40 hover:-translate-y-0.5",
        ink: "bg-ink text-sand ring-1 ring-ink/10 hover:bg-ink/85",
        cream: "bg-cream text-terra-deep shadow-sm hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent text-ink hover:bg-glass",
        secondary: "bg-sand text-ink hover:bg-sand-deep",
        ghost: "text-ink/70 hover:bg-glass hover:text-ink",
        link: "text-terra underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-xs",
        xs: "h-7 px-3 text-[11px]",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
