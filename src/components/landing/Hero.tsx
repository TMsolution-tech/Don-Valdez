import Image from 'next/image'
import Link from 'next/link'

const FEATURES = [
  {
    title: 'Reserva rápida',
    text: 'Elegí tu horario en pocos clics.',
    icon: (
      <path d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    ),
  },
  {
    title: 'Pago facilitado',
    text: 'Seña online con Mercado Pago.',
    icon: (
      <path d="M3 7h18v10H3zM3 10h18" />
    ),
  },
  {
    title: 'Profesionalidad',
    text: 'Atención de primer nivel, siempre.',
    icon: (
      <path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM9.5 13 8 20l4-2.2L16 20l-1.5-7" />
    ),
  },
  {
    title: 'Buenos mates y buena charla',
    text: 'Te esperamos con los mates listos.',
    icon: (
      <path d="M6 10h11a5.5 5.5 0 0 1-5.5 7h0A5.5 5.5 0 0 1 6 10ZM16.5 3l-4 7" />
    ),
  },
]

export function Hero() {
  return (
    <section className="bg-bosque">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2">
        <div>
          <h1 className="font-tag text-6xl leading-[0.95] text-tinta sm:text-7xl">
            Tu estilo,
            <br />
            <span className="text-verde">nuestra firma.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-tinta-soft sm:text-base">
            Reservá tu turno online y viví la mejor experiencia de barbería en
            Salta. Confirmás con la seña y listo.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/turnos"
              className="rounded-lg bg-verde px-8 py-3 text-sm font-bold uppercase tracking-wider text-crema transition hover:bg-tinta"
            >
              Agendar ahora
            </Link>
            <a
              href="#servicios"
              className="rounded-lg border border-verde/30 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-verde transition hover:border-verde"
            >
              Ver servicios
            </a>
          </div>
        </div>

        {/* Donde iría la foto: el logo del local */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative -rotate-2 rounded-3xl border border-rivera bg-pino p-8 shadow-2xl shadow-black/50 sm:p-10">
            <Image
              src="/logo-white.png"
              alt="Don Valdez — Barber Studio, Salta Argentina"
              width={807}
              height={399}
              className="h-auto w-72 sm:w-96"
              priority
            />
          </div>
        </div>
      </div>

      {/* franja de features */}
      <div className="border-t border-rivera bg-pino">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 h-6 w-6 shrink-0 text-salvia"
              >
                {f.icon}
              </svg>
              <div>
                <p className="text-sm font-semibold text-crema">{f.title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
