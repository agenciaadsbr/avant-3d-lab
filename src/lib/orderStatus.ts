export const ORDER_STATUS_LABEL: Record<string, string> = {
  "try-on": "Home Try-On",
  pending: "Aguardando",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  "try-on": { bg: "#fce8ff", color: "#8a1ab8" },
  pending: { bg: "#fff8e1", color: "#b8891a" },
  confirmed: { bg: "#e8f4fd", color: "#1a6a9a" },
  shipped: { bg: "#f0e8ff", color: "#6a30b8" },
  delivered: { bg: "#e8f8e8", color: "#1a8a2a" },
  cancelled: { bg: "#fee8e8", color: "#c04040" },
};

export const ORDER_STATUS_ICON: Record<string, string> = {
  "try-on": "👗",
  pending: "🕒",
  confirmed: "✅",
  shipped: "🚚",
  delivered: "📦",
  cancelled: "✕",
};
