import type { Comment } from '@/lib/types'
import { CommentForm } from './CommentForm'

export function CommentsSection({ comments }: { comments: Comment[] }) {
  return (
    <section id="comentarios" className="mx-auto max-w-3xl px-4 py-20">
      <h2 className="text-center font-display text-4xl tracking-wider text-verde sm:text-5xl">
        LO QUE DICEN LOS CLIENTES
      </h2>
      <div className="mt-10 space-y-4">
        {comments.map((c) => (
          <blockquote
            key={c.id}
            className="rounded-lg border border-line bg-card p-4"
          >
            <p className="text-sm text-ink">{c.content}</p>
            <footer className="mt-2 text-xs font-medium text-verde-3">
              — {c.author_name}
            </footer>
          </blockquote>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-ink-soft">
            Todavía no hay comentarios. ¡Sé el primero!
          </p>
        )}
      </div>
      <CommentForm />
    </section>
  )
}
