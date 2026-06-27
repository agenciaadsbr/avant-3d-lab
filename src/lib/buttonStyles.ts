/**
 * Estilos padrão para botões responsivos
 * Touch-friendly: 44px min-height em mobile
 */

export const buttonStyles = {
  // Botão primário (preenchido)
  primary: {
    base: {
      backgroundColor: "#b8891a",
      color: "#fff",
      border: "none",
      fontWeight: 900,
      fontSize: "0.875rem",
      borderRadius: "0.75rem",
      cursor: "pointer",
      transition: "all 0.2s",
      minHeight: "44px",
      padding: "0.75rem 1.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    hover: {
      backgroundColor: "#a07715",
      boxShadow: "0 4px 12px rgba(184,137,26,0.3)",
    },
    active: {
      backgroundColor: "#8a6212",
    },
    disabled: {
      backgroundColor: "#d0c0a0",
      cursor: "not-allowed",
      opacity: 0.6,
    },
  },

  // Botão secundário (outline)
  secondary: {
    base: {
      backgroundColor: "#fff",
      color: "#b8891a",
      border: "1px solid #b8891a",
      fontWeight: 900,
      fontSize: "0.875rem",
      borderRadius: "0.75rem",
      cursor: "pointer",
      transition: "all 0.2s",
      minHeight: "44px",
      padding: "0.75rem 1.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    hover: {
      backgroundColor: "#FAF6EE",
      borderColor: "#a07715",
    },
    active: {
      backgroundColor: "#f0e8d0",
    },
    disabled: {
      color: "#d0c0a0",
      borderColor: "#d0c0a0",
      cursor: "not-allowed",
      opacity: 0.6,
    },
  },

  // Botão ghost (sem background)
  ghost: {
    base: {
      backgroundColor: "transparent",
      color: "#b8891a",
      border: "none",
      fontWeight: 700,
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s",
      minHeight: "44px",
      padding: "0.75rem 1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    hover: {
      backgroundColor: "#FAF6EE",
    },
    active: {
      backgroundColor: "#f0e8d0",
    },
    disabled: {
      color: "#d0c0a0",
      cursor: "not-allowed",
      opacity: 0.6,
    },
  },

  // Botão danger (vermelho)
  danger: {
    base: {
      backgroundColor: "#c04040",
      color: "#fff",
      border: "none",
      fontWeight: 900,
      fontSize: "0.875rem",
      borderRadius: "0.75rem",
      cursor: "pointer",
      transition: "all 0.2s",
      minHeight: "44px",
      padding: "0.75rem 1.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    hover: {
      backgroundColor: "#a03030",
      boxShadow: "0 4px 12px rgba(192,64,64,0.3)",
    },
    active: {
      backgroundColor: "#802020",
    },
    disabled: {
      backgroundColor: "#d0a0a0",
      cursor: "not-allowed",
      opacity: 0.6,
    },
  },

  // Botão pequeno (ícones, etc)
  small: {
    base: {
      backgroundColor: "#FAF6EE",
      color: "#b8891a",
      border: "1px solid rgba(140,100,20,0.2)",
      fontWeight: 700,
      fontSize: "0.75rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
      transition: "all 0.2s",
      minHeight: "36px", // um pouco menor que 44px
      padding: "0.5rem 0.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    hover: {
      backgroundColor: "#f0e8d0",
      borderColor: "#b8891a",
    },
    active: {
      backgroundColor: "#e8d8b8",
      borderColor: "#b8891a",
    },
    disabled: {
      cursor: "not-allowed",
      opacity: 0.6,
    },
  },
};

// Helper para combinar estilos base + state
export function getButtonStyle(
  variant: keyof typeof buttonStyles,
  state?: "hover" | "active" | "disabled"
) {
  const variantStyle = buttonStyles[variant];
  if (!state) return variantStyle.base;
  return { ...variantStyle.base, ...(variantStyle[state] || {}) };
}
