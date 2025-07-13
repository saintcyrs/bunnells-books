import React from "react";
import clsx from "clsx";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outlined" | "shadowless";
};

export default function Card({
  children,
  className,
  variant = "default",
  ...props
}: CardProps) {
  const base =
    "bg-white rounded-lg overflow-hidden transition-shadow";
  const variants = {
    default: "shadow hover:shadow-lg border border-gray-200",
    outlined: "border-2 border-blue-500",
    shadowless: "border border-gray-200",
  };
  return (
    <div
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
