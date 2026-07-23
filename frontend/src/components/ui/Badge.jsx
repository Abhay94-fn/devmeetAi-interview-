import React from "react";
import clsx from "clsx";

export default function Badge({
  children,
  variant = "purple", // purple, cyan, green, amber, pink, error
  className,
  ...props
}) {
  const styles = {
    purple: "bg-purple/10 text-purple-light border border-purple/20",
    cyan: "bg-cyan/10 text-cyan-light border border-cyan/20",
    green: "bg-green/10 text-green-light border border-green/20",
    amber: "bg-amber/10 text-amber-light border border-amber/20",
    pink: "bg-pink/10 text-pink-light border border-pink/20",
    error: "bg-error/10 text-error border border-error/20",
  };

  return (
    <span
      className={clsx("pill", styles[variant] || styles.purple, className)}
      {...props}
    >
      {children}
    </span>
  );
}
