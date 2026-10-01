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
    title: 'Trabajo de precisión',
    text: 'Cada corte, terminado a navaja.',
    icon: (
      <path d="M6 9l6 6M14 6l-8 8M4 4l4 4M16 4l4 4M20 20l-6-6" />
    ),
  },
  {
    title: 'Ambiente premium',
    text: 'Un espacio pensado para vos.',
    icon: (
      <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z" />
    ),
  },
  {
    title: 'Pago facilitado',
    text: 'Seña online con Mercado Pago.',
    icon: (
      <path d="M3 7h18v10H3zM3 10h18" />
    ),
  },
]

export function Hero() {
  return (
    <section className="bg-bosque">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-salvia">
            Estilo · Tradición · Barbería
          </p>
          <h1 className="mt-4 font-tag text-6xl leading-[0.95] text-crema sm:text-7xl">
            Tu estilo,
            <br />
            <span className="text-salvia">nuestra firma.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            Reservá tu turno online y viví la mejor experiencia de barbería en
            Salta. Confirmás con la seña y listo.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/turnos"
              className="rounded-lg bg-salvia px-8 py-3 text-sm font-bold uppercase tracking-wider text-bosque transition hover:bg-crema"
            >
              Agendar ahora
            </Link>
            <a
              href="#servicios"
              className="rounded-lg border border-rivera px-8 py-3 text-sm font-semibold uppercase tracking-wider text-crema transition hover:border-salvia hover:text-salvia"
            >
              Ver servicios
            </a>
          </div>
        </div>

        {/* Donde iría la foto: el logo del local, en marco claro */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative -rotate-2 rounded-3xl bg-crema p-6 shadow-2xl shadow-black/50 sm:p-8">
            <Image
              src="/logo.png"
              alt="Don Valdez — Barber Studio, Salta Argentina"
              width={360}
              height={360}
              className="h-auto w-64 sm:w-80"
              priority
            />
          </div>
        </div>
      </div>

      {/* franja de features */}
      <div className="border-t border-rivera bg-pino/60">
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
