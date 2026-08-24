import ColdHero from "@/components/ColdHero";
import LoreHero from "@/components/LoreHero";

export default function Compare() {
  return (
    <main className="min-h-svh bg-zinc-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 px-6 py-4 backdrop-blur">
        <h1 className="text-sm font-semibold tracking-wide text-zinc-600">
          Permanent Artist, benchmark base: cold sin Lore vs lore con Lore 3.0
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Izq viola viewport + Inter + gsap.from. Der usa svh + Fraunces + fromTo. Ambos en localhost.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <section className="border-r bg-white">
          <div className="border-b bg-amber-50 px-6 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Cold sin Lore</p>
            <p className="text-xs text-zinc-600">viewport + Inter + gsap.from, falla preflight</p>
          </div>
          <ColdHero />
        </section>
        <section className="bg-white">
          <div className="border-b bg-emerald-50 px-6 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Lore con Lore 3.0</p>
            <p className="text-xs text-zinc-600">svh + Fraunces + fromTo + estado inicial en markup</p>
          </div>
          <LoreHero />
        </section>
      </div>
    </main>
  );
}
