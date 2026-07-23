import React from "react";
import clsx from "clsx";

export default function Input({
  label,
  icon: Icon,
  error,
  className,
  id,
  ...props
}) {
  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-muted uppercase mb-1.5 tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          id={id}
          className={clsx(
            "input-field",
            Icon && "input-field-icon",
            error && "border-error focus:border-error"
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
    </div>
  );
}
