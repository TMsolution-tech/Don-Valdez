import Link from 'next/link'
import type { Service } from '@/lib/types'

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="servicios" className="mx-auto max-w-6xl px-4 py-20">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-salvia">
        Lo que hacemos
      </p>
      <h2 className="mt-2 text-center font-tag text-5xl text-crema">
        Servicios
      </h2>
      <p className="mt-3 text-center text-sm text-ink-soft">
        La reserva se confirma pagando la seña por Mercado Pago.
        El resto se abona en el local.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article
            key={s.id}
            className="group flex flex-col rounded-xl border border-rivera bg-pino p-6 transition hover:border-salvia"
          >
            <h3 className="font-tag text-2xl text-crema group-hover:text-salvia">
              {s.name}
            </h3>
            {s.description && (
              <p className="mt-2 flex-1 text-sm text-ink-soft">{s.description}</p>
            )}
            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wide text-ink-soft">
                {s.duration_min} min
              </span>
              <span className="text-xl font-bold text-salvia">
                ${s.price.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="mt-1 text-xs text-ink-soft">
              Seña: ${s.deposit.toLocaleString('es-AR')}
            </div>
            <Link
              href={`/turnos?servicio=${s.id}`}
              className="mt-5 rounded-lg border border-salvia/60 py-2.5 text-center text-sm font-semibold text-salvia transition group-hover:bg-salvia group-hover:text-bosque"
            >
              Reservar
            </Link>
          </article>
        ))}
        {services.length === 0 && (
          <p className="col-span-full text-center text-ink-soft">
            Servicios disponibles próximamente.
          </p>
        )}
      </div>
    </section>
  )
}
