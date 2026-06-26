import React, { ButtonHTMLAttributes, ReactNode, useState } from "react";
import { buttonStyles } from "@/lib/buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonStyles;
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  children,
  loading = false,
  disabled = false,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyle = buttonStyles[variant];
  const baseStyle = variantStyle.base;
  const stateStyle =
    disabled ? variantStyle.disabled : isHovered ? variantStyle.hover : {};

  const finalStyle = { ...baseStyle, ...stateStyle, ...style };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={finalStyle}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
    >
      {loading ? "Carregando..." : children}
    </button>
  );
}
