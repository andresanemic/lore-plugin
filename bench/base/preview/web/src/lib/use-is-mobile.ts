"use client";

import { useState, useEffect } from "react";

/**
 * Guard de viewport para desactivar pin/animaciones pesadas en móvil
 * (lore/animation.md — pin GSAP debe desactivarse completo en mobile).
 * Estado inicial `false` y resuelto en cliente para evitar hydration mismatch
 * (lore/routing.md).
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
