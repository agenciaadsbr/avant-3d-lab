/**
 * Breakpoints e helpers para responsividade
 * Mobile-first approach
 */

export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

/**
 * Media query strings para usar em style objects
 * Uso: if (window.innerWidth < BREAKPOINTS.tablet) { ... }
 */
export const mq = {
  mobile: `@media (max-width: ${BREAKPOINTS.tablet - 1}px)`,
  tablet: `@media (min-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `@media (min-width: ${BREAKPOINTS.desktop}px)`,
  wide: `@media (min-width: ${BREAKPOINTS.wide}px)`,
  touchUp: `@media (max-width: ${BREAKPOINTS.tablet - 1}px)`, // mobile e tablet
} as const;

/**
 * Espaçamentos responsivos
 */
export const spacing = {
  mobile: {
    padding: "1rem",
    gap: "0.75rem",
    borderRadius: "0.75rem",
  },
  tablet: {
    padding: "1.25rem",
    gap: "1rem",
    borderRadius: "1rem",
  },
  desktop: {
    padding: "1.5rem",
    gap: "1.5rem",
    borderRadius: "1.25rem",
  },
} as const;

/**
 * Tamanhos de fonte responsivos
 */
export const fontSize = {
  h1: { mobile: "1.5rem", desktop: "1.75rem" },
  h2: { mobile: "1.25rem", desktop: "1.5rem" },
  h3: { mobile: "1rem", desktop: "1.1rem" },
  body: { mobile: "0.875rem", desktop: "1rem" },
  small: { mobile: "0.75rem", desktop: "0.85rem" },
  tiny: { mobile: "0.65rem", desktop: "0.75rem" },
} as const;

/**
 * Função helper para media queries em estilo inline
 */
export const isMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < BREAKPOINTS.tablet;
};

export const isTablet = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= BREAKPOINTS.tablet && window.innerWidth < BREAKPOINTS.desktop;
};

export const isDesktop = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= BREAKPOINTS.desktop;
};
