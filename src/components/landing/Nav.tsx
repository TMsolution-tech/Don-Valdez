import Image from 'next/image'
import Link from 'next/link'

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-rivera bg-bosque/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Don Valdez — inicio">
          <Image
            src="/logo-light.png"
            alt="Don Valdez — Barber Studio"
            width={807}
            height={399}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-widest text-ink-soft sm:flex">
          <a href="#servicios" className="hover:text-salvia">Servicios</a>
          <a href="#info" className="hover:text-salvia">Nosotros</a>
          <a href="#comentarios" className="hover:text-salvia">Comentarios</a>
        </nav>
        <Link
          href="/turnos"
          className="rounded-lg bg-salvia px-5 py-2 text-sm font-semibold text-bosque transition hover:bg-crema"
        >
          Reservar turno
        </Link>
      </div>
    </header>
  )
}
