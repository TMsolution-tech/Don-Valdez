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
    <section id="info" className="border-y border-line bg-crema/60">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-20 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl tracking-wider text-verde">
            HORARIOS
          </h2>
          <ul className="mt-6 space-y-2 text-sm">
            {ORDER.map((d) => {
              const ranges = hours.filter((h) => h.weekday === d && h.is_active)
              return (
                <li key={d} className="flex justify-between border-b border-line/70 pb-2">
                  <span className="font-medium">{DAY_NAMES[d]}</span>
                  <span className="text-ink-soft">
                    {ranges.length
                      ? ranges.map((r) => `${fmt(r.open_time)}–${fmt(r.close_time)}`).join('  ·  ')
                      : 'Cerrado'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-4xl tracking-wider text-verde">
            ENCONTRANOS
          </h2>
          <div className="mt-6 space-y-4 text-sm">
            <p>
              <span className="font-medium">Dirección</span>
              <br />
              <span className="text-ink-soft">
                {/* TODO: dirección real del local */}
                Salta Capital, Argentina
              </span>
            </p>
            <p>
              <span className="font-medium">Instagram</span>
              <br />
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-verde-3 underline underline-offset-2 hover:text-verde"
              >
                @donvaldez.studio
              </a>
            </p>
            <p className="rounded-lg border border-line bg-card p-4 text-xs text-ink-soft">
              Los turnos se confirman con seña vía Mercado Pago.
              Si no podés venir, avisá con anticipación.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
