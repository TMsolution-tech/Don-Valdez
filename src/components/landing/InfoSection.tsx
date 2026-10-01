import type { BusinessHours } from '@/lib/types'

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

// orden de lunes a domingo para mostrar
const ORDER = [1, 2, 3, 4, 5, 6, 0]

const MAPS_EMBED =
  'https://www.google.com/maps/embed?pb=!4v1790880737207!6m8!1m7!1shQuCFKdZdYp-XHrJjQ2kWg!2m2!1d-24.78354147852886!2d-65.44801970228131!3f67.24135061316024!4f-6.4403666105966835!5f0.7820865974627469'

const SOCIALS = [
  {
    label: 'Instagram',
    handle: '@donvaldez.studio',
    url: 'https://www.instagram.com/donvaldez.studio/',
  },
  {
    label: 'Instagram (Juan)',
    handle: '@juanvaldeez.7',
    url: 'https://www.instagram.com/juanvaldeez.7/',
  },
  {
    label: 'TikTok',
    handle: '@don.valdez.studio',
    url: 'https://www.tiktok.com/@don.valdez.studio',
  },
]

function fmt(t: string) {
  return t.slice(0, 5)
}

export function InfoSection({ hours }: { hours: BusinessHours[] }) {
  return (
    <section id="info" className="border-y border-rivera bg-pino">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-salvia">
            Cuándo
          </p>
          <h2 className="mt-2 font-tag text-5xl text-crema">Horarios</h2>
          <ul className="mt-8 space-y-3 text-sm">
            {ORDER.map((d) => {
              const ranges = hours.filter((h) => h.weekday === d && h.is_active)
              return (
                <li
                  key={d}
                  className="flex justify-between border-b border-rivera/60 pb-3"
                >
                  <span className="font-medium text-crema">{DAY_NAMES[d]}</span>
                  <span className="text-ink-soft">
                    {ranges.length
                      ? ranges
                          .map((r) => `${fmt(r.open_time)}–${fmt(r.close_time)}`)
                          .join('  ·  ')
                      : 'Cerrado'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-salvia">
            Dónde
          </p>
          <h2 className="mt-2 font-tag text-5xl text-crema">Encontranos</h2>
          <div className="mt-8 space-y-5 text-sm">
            <div className="overflow-hidden rounded-xl border border-rivera">
              <iframe
                src={MAPS_EMBED}
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-64 w-full"
                title="Ubicación de Don Valdez — Salta"
              />
            </div>
            <div className="space-y-2">
              <span className="font-medium text-crema">Redes</span>
              <ul className="mt-1 space-y-1.5">
                {SOCIALS.map((s) => (
                  <li key={s.url} className="flex items-baseline gap-2">
                    <span className="text-xs uppercase tracking-wide text-ink-soft">
                      {s.label}
                    </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-salvia underline underline-offset-4 hover:text-crema"
                    >
                      {s.handle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="rounded-xl border border-rivera bg-musgo/50 p-4 text-xs leading-relaxed text-ink-soft">
              Los turnos se confirman con seña vía Mercado Pago.
              Si no podés venir, avisá con anticipación.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
