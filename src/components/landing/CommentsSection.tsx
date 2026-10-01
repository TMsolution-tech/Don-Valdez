import type { Comment } from '@/lib/types'
import { CommentForm } from './CommentForm'

export function CommentsSection({ comments }: { comments: Comment[] }) {
  return (
    <section id="comentarios" className="mx-auto max-w-3xl px-4 py-20">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-salvia">
        Ellos ya vinieron
      </p>
      <h2 className="mt-2 text-center font-tag text-5xl text-crema">
        Lo que dicen
      </h2>
      <div className="mt-12 space-y-4">
        {comments.map((c) => (
          <blockquote
            key={c.id}
            className="rounded-xl border border-rivera bg-pino p-5"
          >
            <p className="text-sm leading-relaxed text-crema">{c.content}</p>
            <footer className="mt-3 text-xs font-semibold uppercase tracking-wide text-salvia">
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
