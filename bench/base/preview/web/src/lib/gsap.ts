// lore/routing.md — centralizar imports de GSAP aquí con guard SSR.
// Nunca importar gsap/plugins directamente en componentes.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
