'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CommentForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('') // honeypot anti-spam
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_name: name, content, website }),
    })
    if (res.ok) {
      setStatus('ok')
      setName('')
      setContent('')
      router.refresh()
    } else {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'No se pudo enviar el comentario')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 rounded-lg border border-line bg-card p-5">
      <h3 className="font-display text-xl tracking-wide text-verde">
        DEJÁ TU COMENTARIO
      </h3>
      {/* honeypot: invisible para humanos */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="mt-3 grid gap-3">
        <input
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="rounded border border-line bg-white px-3 py-2 text-sm focus:border-verde-3 focus:outline-none"
        />
        <textarea
          required
          maxLength={600}
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contanos cómo te fue…"
          className="rounded border border-line bg-white px-3 py-2 text-sm focus:border-verde-3 focus:outline-none"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      {status === 'ok' && (
        <p className="mt-2 text-sm text-verde-3">¡Gracias por tu comentario!</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-3 rounded bg-verde px-5 py-2 text-sm font-semibold text-crema hover:bg-verde-2 disabled:opacity-50"
      >
        {status === 'sending' ? 'Enviando…' : 'Publicar'}
      </button>
    </form>
  )
}
