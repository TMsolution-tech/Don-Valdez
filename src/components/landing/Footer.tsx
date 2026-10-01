import Image from 'next/image'

const INSTAGRAM_URL = 'https://www.instagram.com/donvaldez.studio/'

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
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-sm text-ink-soft underline underline-offset-4 hover:text-salvia"
        >
          @donvaldez.studio
        </a>
        <p className="mt-6 text-xs text-ink-soft/60">
          Desarrollado por TM Soluciones Digitales
        </p>
      </div>
    </footer>
  )
}
