import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Shortcuts
export function useMobileView() {
  return useMediaQuery("(max-width: 767px)");
}

export function useTabletView() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useDesktopView() {
  return useMediaQuery("(min-width: 1024px)");
}
