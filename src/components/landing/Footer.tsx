import Image from 'next/image'

const SOCIALS = [
  { label: '@donvaldez.studio', url: 'https://www.instagram.com/donvaldez.studio/' },
  { label: '@juanvaldeez.7', url: 'https://www.instagram.com/juanvaldeez.7/' },
  { label: 'TikTok @don.valdez.studio', url: 'https://www.tiktok.com/@don.valdez.studio' },
]

export function Footer() {
  return (
    <footer className="border-t border-rivera bg-pino">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-12 text-center">
        <Image
          src="/logo-white.png"
          alt="Don Valdez — Barber Studio"
          width={807}
          height={399}
          className="h-12 w-auto"
        />
        <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
          {SOCIALS.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-soft underline underline-offset-4 hover:text-salvia"
            >
              {s.label}
            </a>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-soft/60">
          Desarrollado por TM Soluciones Digitales
        </p>
      </div>
    </footer>
  )
}
