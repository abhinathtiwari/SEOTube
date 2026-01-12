/** Reusable button component with customizable styles and interaction states. */
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "default";
  className?: string;
};

export default function Button({ variant = "default", className = "", children, ...rest }: Props) {
  let cls = "btn";
  if (variant === "primary") cls += " btn-primary";
  if (variant === "ghost") cls += " btn-ghost";
  if (className) cls += ` ${className}`;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
