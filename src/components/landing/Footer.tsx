const INSTAGRAM_URL = 'https://www.instagram.com/donvaldez.studio/'

export function Footer() {
  return (
    <footer className="bg-verde text-crema">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center">
        <span className="font-display text-3xl tracking-wider">DON VALDEZ</span>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-crema/80 underline underline-offset-2 hover:text-gold"
        >
          @donvaldez.studio
        </a>
        <p className="mt-4 text-xs text-crema/50">
          Desarrollado por TM Soluciones Digitales
        </p>
      </div>
    </footer>
  )
}
