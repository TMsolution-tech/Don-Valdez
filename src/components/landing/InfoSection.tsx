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

const INSTAGRAM_URL = 'https://www.instagram.com/donvaldez.studio/'

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
            <p>
              <span className="font-medium text-crema">Dirección</span>
              <br />
              <span className="text-ink-soft">
                {/* TODO: dirección real del local */}
                Salta Capital, Argentina
              </span>
            </p>
            <p>
              <span className="font-medium text-crema">Instagram</span>
              <br />
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-salvia underline underline-offset-4 hover:text-crema"
              >
                @donvaldez.studio
              </a>
            </p>
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
