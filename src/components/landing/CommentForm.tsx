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

  const inputCls =
    'w-full rounded-lg border border-rivera bg-musgo px-3 py-2.5 text-sm text-crema placeholder:text-ink-soft/60 focus:border-salvia focus:outline-none'

  return (
    <form onSubmit={onSubmit} className="mt-10 rounded-xl border border-rivera bg-pino p-6">
      <h3 className="font-tag text-2xl text-crema">
        Dejá tu comentario
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
      <div className="mt-4 grid gap-3">
        <input
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className={inputCls}
        />
        <textarea
          required
          maxLength={600}
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contanos cómo te fue…"
          className={inputCls}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {status === 'ok' && (
        <p className="mt-2 text-sm text-salvia">¡Gracias por tu comentario!</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-4 rounded-lg bg-salvia px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-bosque transition hover:bg-crema disabled:opacity-50"
      >
        {status === 'sending' ? 'Enviando…' : 'Publicar'}
      </button>
    </form>
  )
}
