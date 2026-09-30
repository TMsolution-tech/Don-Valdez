import Link from 'next/link'
import type { Service } from '@/lib/types'

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="servicios" className="mx-auto max-w-5xl px-4 py-20">
      <h2 className="text-center font-display text-4xl tracking-wider text-verde sm:text-5xl">
        SERVICIOS
      </h2>
      <p className="mt-2 text-center text-sm text-ink-soft">
        La reserva se confirma pagando la seña por Mercado Pago.
        El resto se abona en el local.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article
            key={s.id}
            className="flex flex-col rounded-lg border border-line bg-card p-5 shadow-sm"
          >
            <h3 className="font-display text-2xl tracking-wide text-verde">
              {s.name}
            </h3>
            {s.description && (
              <p className="mt-1 flex-1 text-sm text-ink-soft">{s.description}</p>
            )}
            <div className="mt-4 flex items-baseline justify-between text-sm">
              <span className="text-ink-soft">{s.duration_min} min</span>
              <span className="text-lg font-semibold text-ink">
                ${s.price.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="mt-1 text-xs text-verde-3">
              Seña: ${s.deposit.toLocaleString('es-AR')}
            </div>
            <Link
              href={`/turnos?servicio=${s.id}`}
              className="mt-4 rounded bg-verde py-2 text-center text-sm font-semibold text-crema hover:bg-verde-2"
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
