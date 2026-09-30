import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-verde text-crema">
      {/* franja club: verde / crema / dorado */}
      <div className="h-2 w-full bg-gradient-to-r from-verde-3 via-crema to-gold" />
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:py-32">
        {/* Placeholder del logo — reemplazar por el asset oficial */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-crema bg-verde-2 font-display text-4xl">
          DV
        </div>
        <h1 className="font-display text-6xl leading-none sm:text-8xl">
          DON VALDEZ
        </h1>
        <p className="mt-2 font-display text-xl tracking-[0.3em] text-gold sm:text-2xl">
          BARBER STUDIO
        </p>
        <p className="mt-6 max-w-md text-sm text-crema/80 sm:text-base">
          Cortes clásicos y modernos con la precisión de siempre.
          Reservá tu turno online y asegurá tu lugar con la seña.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/turnos"
            className="rounded-full bg-crema px-8 py-3 font-display text-xl tracking-wider text-verde transition hover:bg-gold hover:text-white"
          >
            RESERVAR TURNO
          </Link>
          <a
            href="#servicios"
            className="rounded-full border border-crema/50 px-8 py-3 font-display text-xl tracking-wider hover:border-gold hover:text-gold"
          >
            VER SERVICIOS
          </a>
        </div>
      </div>
      <div className="h-2 w-full bg-gradient-to-r from-gold via-crema to-verde-3" />
    </section>
  )
}
