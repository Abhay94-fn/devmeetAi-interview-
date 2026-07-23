import React from "react";
import clsx from "clsx";

export default function Card({
  children,
  className,
  hoverable = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        hoverable ? "glass-card" : "glass-card-static",
        onClick && "cursor-pointer",
        "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
