import Link from 'next/link'

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-verde-2/40 bg-verde text-crema">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-display text-2xl tracking-wide">
          DON VALDEZ
        </Link>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <a href="#servicios" className="hover:text-gold">Servicios</a>
          <a href="#info" className="hover:text-gold">Nosotros</a>
          <a href="#comentarios" className="hover:text-gold">Comentarios</a>
        </nav>
        <Link
          href="/turnos"
          className="rounded-full bg-crema px-4 py-1.5 text-sm font-semibold text-verde hover:bg-gold hover:text-white"
        >
          Reservar turno
        </Link>
      </div>
    </header>
  )
}
